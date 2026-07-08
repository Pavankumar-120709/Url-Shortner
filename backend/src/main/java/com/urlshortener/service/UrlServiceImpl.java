package com.urlshortener.service;

import com.urlshortener.dto.UrlRequestDto;
import com.urlshortener.dto.UrlResponseDto;
import com.urlshortener.entity.Url;
import com.urlshortener.exception.ClickLimitExceededException;
import com.urlshortener.exception.InvalidUrlException;
import com.urlshortener.exception.ResourceNotFoundException;
import com.urlshortener.exception.UrlExpiredException;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.util.ShortCodeGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final AnalyticsService analyticsService;
    private final String baseUrl;

    // Standard constructor injection with @Value injection support
    public UrlServiceImpl(UrlRepository urlRepository,
                          AnalyticsService analyticsService,
                          @Value("${app.base-url:http://localhost:8080}") String baseUrl) {
        this.urlRepository = urlRepository;
        this.analyticsService = analyticsService;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    }

    @Override
    @Transactional
    public UrlResponseDto createUrl(UrlRequestDto request) {
        log.info("Creating short URL for: {}", request.getOriginalUrl());
        
        String shortCode = request.getCustomAlias();
        if (shortCode != null && !shortCode.isBlank()) {
            shortCode = shortCode.trim();
            if (urlRepository.existsByShortCode(shortCode) || urlRepository.existsByCustomAlias(shortCode)) {
                throw new InvalidUrlException("Custom alias '" + shortCode + "' is already in use");
            }
        } else {
            shortCode = generateUniqueShortCode();
        }

        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .customAlias(request.getCustomAlias() != null && !request.getCustomAlias().isBlank() ? request.getCustomAlias().trim() : null)
                .maxClicks(request.getMaxClicks())
                .expiresAt(request.getExpiresAt())
                .notes(request.getNotes())
                .build();

        Url savedUrl = urlRepository.save(url);
        return mapToResponseDto(savedUrl);
    }

    @Override
    @Transactional
    public List<UrlResponseDto> createUrlsBulk(List<UrlRequestDto> requests) {
        log.info("Bulk creating {} URLs", requests.size());
        List<UrlResponseDto> responses = new ArrayList<>();
        for (UrlRequestDto request : requests) {
            responses.add(createUrl(request));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public UrlResponseDto getUrlById(Long id) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));
        return mapToResponseDto(url);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UrlResponseDto> getAllUrls(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Url> urlPage;
        if (search != null && !search.isBlank()) {
            urlPage = urlRepository.findByOriginalUrlContainingIgnoreCaseOrNotesContainingIgnoreCaseOrShortCodeContainingIgnoreCase(
                    search, search, search, pageable);
        } else {
            urlPage = urlRepository.findAll(pageable);
        }

        return urlPage.map(this::mapToResponseDto);
    }

    @Override
    @Transactional
    public UrlResponseDto updateUrl(Long id, UrlRequestDto request) {
        log.info("Updating URL with id: {}", id);
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));

        url.setOriginalUrl(request.getOriginalUrl());
        url.setNotes(request.getNotes());
        url.setMaxClicks(request.getMaxClicks());
        url.setExpiresAt(request.getExpiresAt());

        // Check and update custom alias if changing
        String newAlias = request.getCustomAlias();
        if (newAlias != null && !newAlias.isBlank()) {
            newAlias = newAlias.trim();
            if (!newAlias.equals(url.getCustomAlias())) {
                if (urlRepository.existsByShortCode(newAlias) || urlRepository.existsByCustomAlias(newAlias)) {
                    throw new InvalidUrlException("Custom alias '" + newAlias + "' is already in use");
                }
                url.setCustomAlias(newAlias);
            }
        } else {
            url.setCustomAlias(null);
        }

        Url updatedUrl = urlRepository.save(url);
        return mapToResponseDto(updatedUrl);
    }

    @Override
    @Transactional
    public void deleteUrl(Long id) {
        log.info("Deleting URL with id: {}", id);
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found with id: " + id));
        urlRepository.delete(url);
    }

    @Override
    @Transactional
    public String resolveAndLogClick(String shortCode, HttpServletRequest request) {
        log.info("Resolving short code: {}", shortCode);
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL code '" + shortCode + "' not found"));

        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UrlExpiredException("The short URL has expired on " + url.getExpiresAt());
        }

        if (url.getMaxClicks() != null && url.getClickCount() >= url.getMaxClicks()) {
            throw new ClickLimitExceededException("The click limit (" + url.getMaxClicks() + ") for this link has been exceeded.");
        }

        // Asynchronously or inline log analytics visit details
        analyticsService.logVisit(url, request);

        // Update click count
        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);

        return url.getOriginalUrl();
    }

    private String generateUniqueShortCode() {
        int attempts = 0;
        String code;
        do {
            code = ShortCodeGenerator.generate();
            attempts++;
            if (attempts > 5) {
                // Highly unlikely Base62 collision, but here is a safe fallback incrementer
                code = code + System.currentTimeMillis();
            }
        } while (urlRepository.existsByShortCode(code));
        return code;
    }

    private UrlResponseDto mapToResponseDto(Url url) {
        String code = url.getCustomAlias() != null ? url.getCustomAlias() : url.getShortCode();
        return UrlResponseDto.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .customAlias(url.getCustomAlias())
                .shortUrl(baseUrl + code)
                .clickCount(url.getClickCount())
                .maxClicks(url.getMaxClicks())
                .notes(url.getNotes())
                .expiresAt(url.getExpiresAt())
                .createdAt(url.getCreatedAt())
                .updatedAt(url.getUpdatedAt())
                .build();
    }
}
