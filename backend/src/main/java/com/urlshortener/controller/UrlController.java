package com.urlshortener.controller;

import com.urlshortener.dto.UrlRequestDto;
import com.urlshortener.dto.UrlResponseDto;
import com.urlshortener.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/urls")
@Tag(name = "URL Management", description = "APIs for creating, updating, deleting, listing, and bulk-creating short URLs.")
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    @PostMapping
    @Operation(summary = "Create short URL", description = "Generates a 7-character short URL code or accepts a unique custom alias.")
    public ResponseEntity<UrlResponseDto> createUrl(@Valid @RequestBody UrlRequestDto request) {
        UrlResponseDto response = urlService.createUrl(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk create short URLs", description = "Creates multiple short URLs in a single batch request.")
    public ResponseEntity<List<UrlResponseDto>> createUrlsBulk(@Valid @RequestBody List<UrlRequestDto> requests) {
        List<UrlResponseDto> response = urlService.createUrlsBulk(requests);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get URL details", description = "Fetches complete details for a URL by its system ID.")
    public ResponseEntity<UrlResponseDto> getUrlById(@PathVariable Long id) {
        UrlResponseDto response = urlService.getUrlById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List short URLs", description = "Fetches a paginated, sorted, and searchable list of all active and inactive short URLs.")
    public ResponseEntity<Page<UrlResponseDto>> getAllUrls(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        Page<UrlResponseDto> response = urlService.getAllUrls(search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update short URL", description = "Modifies the target URL, custom alias, click limit, expiration dates, or notes.")
    public ResponseEntity<UrlResponseDto> updateUrl(@PathVariable Long id, @Valid @RequestBody UrlRequestDto request) {
        UrlResponseDto response = urlService.updateUrl(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete short URL", description = "Deletes a short URL and all its associated click analytics data cascade.")
    public ResponseEntity<Void> deleteUrl(@PathVariable Long id) {
        urlService.deleteUrl(id);
        return ResponseEntity.noContent().build();
    }
}
