package com.urlshortener.service;

import com.urlshortener.dto.AnalyticsResponseDto;
import com.urlshortener.dto.DashboardStatsDto;
import com.urlshortener.dto.ChartDataPoint;
import com.urlshortener.dto.DateDataPoint;
import com.urlshortener.entity.Analytics;
import com.urlshortener.entity.Url;
import com.urlshortener.exception.ResourceNotFoundException;
import com.urlshortener.repository.AnalyticsRepository;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.util.IpResolver;
import com.urlshortener.util.UserAgentParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final UrlRepository urlRepository;
    private final GeoIpService geoIpService;

    public AnalyticsServiceImpl(AnalyticsRepository analyticsRepository,
                                UrlRepository urlRepository,
                                GeoIpService geoIpService) {
        this.analyticsRepository = analyticsRepository;
        this.urlRepository = urlRepository;
        this.geoIpService = geoIpService;
    }

    @Override
    @Transactional
    public void logVisit(Url url, HttpServletRequest request) {
        if (request == null) {
            log.warn("Null request passed to logVisit, logging placeholder values");
            Analytics analytics = Analytics.builder()
                    .url(url)
                    .ipAddress("127.0.0.1")
                    .browser("Unknown")
                    .operatingSystem("Unknown")
                    .device("Desktop")
                    .platform("Unknown")
                    .userAgent("Mock")
                    .referrer("Direct")
                    .language("en")
                    .country("Localhost")
                    .city("Local Network")
                    .build();
            analyticsRepository.save(analytics);
            return;
        }

        String userAgent = request.getHeader("User-Agent");
        UserAgentParser.UserAgentInfo uaInfo = UserAgentParser.parse(userAgent);

        String ipAddress = IpResolver.resolve(request);
        GeoIpService.Location location = geoIpService.resolveIp(ipAddress);

        String referrer = request.getHeader("Referer"); // HTTP header is spelled 'Referer'
        if (referrer == null || referrer.isBlank()) {
            referrer = "Direct";
        }

        String language = request.getHeader("Accept-Language");
        if (language != null && !language.isBlank()) {
            // "en-US,en;q=0.9" -> "en-US"
            language = language.split(",")[0].split(";")[0].trim();
        } else {
            language = "en";
        }

        Analytics analytics = Analytics.builder()
                .url(url)
                .ipAddress(ipAddress)
                .userAgent(userAgent != null && userAgent.length() > 512 ? userAgent.substring(0, 512) : userAgent)
                .browser(uaInfo.getBrowser())
                .operatingSystem(uaInfo.getOperatingSystem())
                .device(uaInfo.getDevice())
                .platform(uaInfo.getPlatform())
                .referrer(referrer.length() > 1024 ? referrer.substring(0, 1024) : referrer)
                .language(language.length() > 50 ? language.substring(0, 50) : language)
                .country(location.getCountry())
                .city(location.getCity())
                .build();

        analyticsRepository.save(analytics);
        log.debug("Logged visit details for URL short_code: {}", url.getShortCode());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        log.info("Fetching global dashboard statistics");
        long totalLinks = urlRepository.count();
        long totalClicks = urlRepository.sumTotalClicks();

        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
        long todayClicks = analyticsRepository.countClicksSince(startOfToday);

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
        long monthlyClicks = analyticsRepository.countClicksSince(startOfMonth);

        long activeLinks = urlRepository.countActiveUrls(LocalDateTime.now());
        long expiredLinks = totalLinks - activeLinks;
        long qrCodesGenerated = totalLinks; // Every link is issued a QR code

        // Find most visited URL
        List<Url> topUrls = urlRepository.findAll(
                PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "clickCount"))
        ).getContent();

        String mostVisitedLinkCode = "N/A";
        String mostVisitedLinkOriginal = "N/A";
        long mostVisitedLinkClicks = 0;

        if (!topUrls.isEmpty()) {
            Url topUrl = topUrls.get(0);
            mostVisitedLinkCode = topUrl.getShortCode();
            mostVisitedLinkOriginal = topUrl.getOriginalUrl();
            mostVisitedLinkClicks = topUrl.getClickCount();
        }

        // Fetch distributions
        List<Analytics> recentLogs = analyticsRepository.findTop10ByOrderByVisitedAtDesc();
        List<AnalyticsResponseDto> recentActivity = recentLogs.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        List<DateDataPoint> clicksPerDay = analyticsRepository.findGlobalDailyClicks();
        List<ChartDataPoint> browserDistribution = analyticsRepository.findGlobalBrowserDistribution();
        List<ChartDataPoint> osDistribution = analyticsRepository.findGlobalOsDistribution();
        List<ChartDataPoint> deviceDistribution = analyticsRepository.findGlobalDeviceDistribution();
        List<ChartDataPoint> countryDistribution = analyticsRepository.findGlobalCountryDistribution();
        List<ChartDataPoint> referrerDistribution = analyticsRepository.findGlobalReferrerDistribution();

        return DashboardStatsDto.builder()
                .totalLinks(totalLinks)
                .totalClicks(totalClicks)
                .todayClicks(todayClicks)
                .monthlyClicks(monthlyClicks)
                .activeLinks(activeLinks)
                .expiredLinks(expiredLinks)
                .qrCodesGenerated(qrCodesGenerated)
                .mostVisitedLinkCode(mostVisitedLinkCode)
                .mostVisitedLinkOriginal(mostVisitedLinkOriginal)
                .mostVisitedLinkClicks(mostVisitedLinkClicks)
                .recentActivity(recentActivity)
                .clicksPerDay(clicksPerDay)
                .browserDistribution(browserDistribution)
                .osDistribution(osDistribution)
                .deviceDistribution(deviceDistribution)
                .countryDistribution(countryDistribution)
                .referrerDistribution(referrerDistribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getUrlStats(String shortCode) {
        log.info("Fetching statistics for URL code: {}", shortCode);
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL code '" + shortCode + "' not found"));

        long totalClicks = url.getClickCount();
        long activeLinks = (url.getExpiresAt() == null || url.getExpiresAt().isAfter(LocalDateTime.now())) && 
                            (url.getMaxClicks() == null || url.getClickCount() < url.getMaxClicks()) ? 1 : 0;
        long expiredLinks = activeLinks == 0 ? 1 : 0;

        // Fetch URL-specific distributions
        List<DateDataPoint> clicksPerDay = analyticsRepository.findDailyClicksByUrlId(url.getId());
        List<ChartDataPoint> browserDistribution = analyticsRepository.findBrowserDistributionByUrlId(url.getId());
        List<ChartDataPoint> osDistribution = analyticsRepository.findOsDistributionByUrlId(url.getId());
        List<ChartDataPoint> deviceDistribution = analyticsRepository.findDeviceDistributionByUrlId(url.getId());
        List<ChartDataPoint> countryDistribution = analyticsRepository.findCountryDistributionByUrlId(url.getId());
        List<ChartDataPoint> referrerDistribution = analyticsRepository.findReferrerDistributionByUrlId(url.getId());

        return DashboardStatsDto.builder()
                .totalLinks(1)
                .totalClicks(totalClicks)
                .todayClicks(totalClicks) // URL-specific breakdown sets totals
                .monthlyClicks(totalClicks)
                .activeLinks(activeLinks)
                .expiredLinks(expiredLinks)
                .qrCodesGenerated(1)
                .mostVisitedLinkCode(url.getShortCode())
                .mostVisitedLinkOriginal(url.getOriginalUrl())
                .mostVisitedLinkClicks(url.getClickCount())
                .clicksPerDay(clicksPerDay)
                .browserDistribution(browserDistribution)
                .osDistribution(osDistribution)
                .deviceDistribution(deviceDistribution)
                .countryDistribution(countryDistribution)
                .referrerDistribution(referrerDistribution)
                .build();
    }

    private AnalyticsResponseDto mapToResponseDto(Analytics analytics) {
        return AnalyticsResponseDto.builder()
                .id(analytics.getId())
                .ipAddress(analytics.getIpAddress())
                .browser(analytics.getBrowser())
                .operatingSystem(analytics.getOperatingSystem())
                .device(analytics.getDevice())
                .country(analytics.getCountry())
                .city(analytics.getCity())
                .language(analytics.getLanguage())
                .platform(analytics.getPlatform())
                .userAgent(analytics.getUserAgent())
                .referrer(analytics.getReferrer())
                .visitedAt(analytics.getVisitedAt())
                .build();
    }
}
