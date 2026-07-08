package com.urlshortener.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponseDto {
    private Long id;
    private String ipAddress;
    private String browser;
    private String operatingSystem;
    private String device;
    private String country;
    private String city;
    private String language;
    private String platform;
    private String userAgent;
    private String referrer;
    private LocalDateTime visitedAt;
}
