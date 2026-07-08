package com.urlshortener.service;

import com.urlshortener.dto.UrlRequestDto;
import com.urlshortener.dto.UrlResponseDto;
import com.urlshortener.entity.Url;
import com.urlshortener.exception.ClickLimitExceededException;
import com.urlshortener.exception.InvalidUrlException;
import com.urlshortener.exception.ResourceNotFoundException;
import com.urlshortener.exception.UrlExpiredException;
import com.urlshortener.repository.UrlRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UrlServiceTest {

    @Mock
    private UrlRepository urlRepository;

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private HttpServletRequest servletRequest;

    private UrlService urlService;

    @BeforeEach
    public void setUp() {
        urlService = new UrlServiceImpl(urlRepository, analyticsService, "http://localhost:8080");
    }

    @Test
    public void testCreateUrl_Success() {
        UrlRequestDto requestDto = UrlRequestDto.builder()
                .originalUrl("https://example.com")
                .notes("Testing notes")
                .build();

        Url mockUrl = Url.builder()
                .id(1L)
                .originalUrl("https://example.com")
                .shortCode("abc1234")
                .clickCount(0)
                .notes("Testing notes")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(urlRepository.existsByShortCode(anyString())).thenReturn(false);
        when(urlRepository.save(any(Url.class))).thenReturn(mockUrl);

        UrlResponseDto response = urlService.createUrl(requestDto);

        assertNotNull(response);
        assertEquals(mockUrl.getId(), response.getId());
        assertEquals(mockUrl.getOriginalUrl(), response.getOriginalUrl());
        assertEquals("http://localhost:8080/abc1234", response.getShortUrl());
        verify(urlRepository, times(1)).save(any(Url.class));
    }

    @Test
    public void testCreateUrl_CustomAliasAlreadyExists() {
        UrlRequestDto requestDto = UrlRequestDto.builder()
                .originalUrl("https://example.com")
                .customAlias("myalias")
                .build();

        when(urlRepository.existsByShortCode("myalias")).thenReturn(true);

        assertThrows(InvalidUrlException.class, () -> urlService.createUrl(requestDto));
        verify(urlRepository, never()).save(any(Url.class));
    }

    @Test
    public void testResolveAndLogClick_Success() {
        Url mockUrl = Url.builder()
                .id(1L)
                .originalUrl("https://example.com")
                .shortCode("abc1234")
                .clickCount(5)
                .build();

        when(urlRepository.findByShortCodeOrCustomAlias("abc1234")).thenReturn(Optional.of(mockUrl));
        when(urlRepository.save(any(Url.class))).thenReturn(mockUrl);

        String originalUrl = urlService.resolveAndLogClick("abc1234", servletRequest);

        assertEquals("https://example.com", originalUrl);
        assertEquals(6, mockUrl.getClickCount());
        verify(analyticsService, times(1)).logVisit(eq(mockUrl), eq(servletRequest));
        verify(urlRepository, times(1)).save(mockUrl);
    }

    @Test
    public void testResolveAndLogClick_Expired() {
        Url mockUrl = Url.builder()
                .id(1L)
                .originalUrl("https://example.com")
                .shortCode("abc1234")
                .expiresAt(LocalDateTime.now().minusDays(1))
                .build();

        when(urlRepository.findByShortCodeOrCustomAlias("abc1234")).thenReturn(Optional.of(mockUrl));

        assertThrows(UrlExpiredException.class, () -> urlService.resolveAndLogClick("abc1234", servletRequest));
        verify(analyticsService, never()).logVisit(any(), any());
        verify(urlRepository, never()).save(any());
    }

    @Test
    public void testResolveAndLogClick_ClickLimitExceeded() {
        Url mockUrl = Url.builder()
                .id(1L)
                .originalUrl("https://example.com")
                .shortCode("abc1234")
                .clickCount(10)
                .maxClicks(10)
                .build();

        when(urlRepository.findByShortCodeOrCustomAlias("abc1234")).thenReturn(Optional.of(mockUrl));

        assertThrows(ClickLimitExceededException.class, () -> urlService.resolveAndLogClick("abc1234", servletRequest));
        verify(analyticsService, never()).logVisit(any(), any());
        verify(urlRepository, never()).save(any());
    }

    @Test
    public void testResolveAndLogClick_NotFound() {
        when(urlRepository.findByShortCodeOrCustomAlias("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> urlService.resolveAndLogClick("nonexistent", servletRequest));
    }
}
