package com.urlshortener.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Actuator & Health", description = "Endpoints for platform monitoring and health checks.")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Get system health status", description = "Simple health probe returning UP status for cluster orchestrators (Kubernetes, Render, etc.).")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
