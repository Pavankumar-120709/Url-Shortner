package com.urlshortener.service;

import com.urlshortener.dto.UrlRequestDto;
import com.urlshortener.dto.UrlResponseDto;
import org.springframework.data.domain.Page;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface UrlService {

    UrlResponseDto createUrl(UrlRequestDto request);

    List<UrlResponseDto> createUrlsBulk(List<UrlRequestDto> requests);

    UrlResponseDto getUrlById(Long id);

    Page<UrlResponseDto> getAllUrls(String search, int page, int size, String sortBy, String sortDir);

    UrlResponseDto updateUrl(Long id, UrlRequestDto request);

    void deleteUrl(Long id);

    String resolveAndLogClick(String shortCode, HttpServletRequest request);
}
