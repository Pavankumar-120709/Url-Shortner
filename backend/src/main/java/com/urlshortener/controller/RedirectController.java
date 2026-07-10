package com.urlshortener.controller;

import com.urlshortener.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@Tag(name = "URL Redirection", description = "Endpoints that resolve short codes to their original destinations.")
public class RedirectController {

    private final UrlService urlService;

    public RedirectController(UrlService urlService) {
        this.urlService = urlService;
    }

    @GetMapping("/")
    @Operation(summary = "Root redirect to Swagger UI", description = "Redirects root requests to the interactive API documentation page.")
    public ResponseEntity<Void> redirectToSwagger() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("/swagger-ui.html"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/{shortCode}")
    @Operation(summary = "Redirect to original destination", description = "Resolves the short code, logs visitor analytics, and issues a 302 (Found) redirect to bypass browser cache.")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode, HttpServletRequest request) {
        String originalUrl = urlService.resolveAndLogClick(shortCode, request);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(originalUrl));
        
        // We use 302 Found (Temporary Redirect) instead of 301 Permanent.
        // This ensures the browser does not cache the redirection, allowing us
        // to capture visitor analytics on every single click.
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
