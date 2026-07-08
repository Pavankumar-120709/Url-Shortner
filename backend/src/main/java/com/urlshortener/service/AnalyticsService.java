package com.urlshortener.service;

import com.urlshortener.dto.DashboardStatsDto;
import com.urlshortener.entity.Url;
import jakarta.servlet.http.HttpServletRequest;

public interface AnalyticsService {

    void logVisit(Url url, HttpServletRequest request);

    DashboardStatsDto getDashboardStats();

    DashboardStatsDto getUrlStats(String shortCode);
}
