package com.urlshortener.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalLinks;
    private long totalClicks;
    private long todayClicks;
    private long monthlyClicks;
    private long activeLinks;
    private long expiredLinks;
    private long qrCodesGenerated;
    private String mostVisitedLinkCode;
    private String mostVisitedLinkOriginal;
    private long mostVisitedLinkClicks;
    
    private List<AnalyticsResponseDto> recentActivity;
    
    private List<DateDataPoint> clicksPerDay;
    private List<ChartDataPoint> browserDistribution;
    private List<ChartDataPoint> osDistribution;
    private List<ChartDataPoint> deviceDistribution;
    private List<ChartDataPoint> countryDistribution;
    private List<ChartDataPoint> referrerDistribution;
}
