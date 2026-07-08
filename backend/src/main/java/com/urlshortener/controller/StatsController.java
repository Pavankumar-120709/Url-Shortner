package com.urlshortener.controller;

import com.urlshortener.dto.DashboardStatsDto;
import com.urlshortener.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stats")
@Tag(name = "Analytics & Stats", description = "APIs for pulling global dashboard counters, time series data, and geographical/browser distributions.")
public class StatsController {

    private final AnalyticsService analyticsService;

    public StatsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @Operation(summary = "Get global dashboard statistics", description = "Fetches aggregated metrics for clicks, browsers, operating systems, devices, countries, and referrers.")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{shortCode}")
    @Operation(summary = "Get stats for specific short URL", description = "Fetches timeline clicks and browser/device/geo distribution specifically for the provided short code or custom alias.")
    public ResponseEntity<DashboardStatsDto> getUrlStats(@PathVariable String shortCode) {
        DashboardStatsDto stats = analyticsService.getUrlStats(shortCode);
        return ResponseEntity.ok(stats);
    }
}
