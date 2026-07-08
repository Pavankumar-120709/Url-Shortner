package com.urlshortener.repository;

import com.urlshortener.entity.Analytics;
import com.urlshortener.dto.ChartDataPoint;
import com.urlshortener.dto.DateDataPoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {

    List<Analytics> findTop10ByOrderByVisitedAtDesc();

    Page<Analytics> findByUrlId(Long urlId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Analytics a WHERE a.visitedAt >= :start")
    long countClicksSince(@Param("start") LocalDateTime start);

    @Query("SELECT COUNT(DISTINCT a.ipAddress) FROM Analytics a")
    long countUniqueVisitors();

    @Query("SELECT COUNT(DISTINCT a.ipAddress) FROM Analytics a WHERE a.url.id = :urlId")
    long countUniqueVisitorsByUrlId(@Param("urlId") Long urlId);

    // Global distributions
    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.browser, 'Unknown'), COUNT(a.id)) FROM Analytics a GROUP BY a.browser ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findGlobalBrowserDistribution();

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.operatingSystem, 'Unknown'), COUNT(a.id)) FROM Analytics a GROUP BY a.operatingSystem ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findGlobalOsDistribution();

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.device, 'Unknown'), COUNT(a.id)) FROM Analytics a GROUP BY a.device ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findGlobalDeviceDistribution();

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.country, 'Unknown'), COUNT(a.id)) FROM Analytics a GROUP BY a.country ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findGlobalCountryDistribution();

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.referrer, 'Direct'), COUNT(a.id)) FROM Analytics a GROUP BY a.referrer ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findGlobalReferrerDistribution();

    // URL-specific distributions
    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.browser, 'Unknown'), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY a.browser ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findBrowserDistributionByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.operatingSystem, 'Unknown'), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY a.operatingSystem ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findOsDistributionByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.device, 'Unknown'), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY a.device ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findDeviceDistributionByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.country, 'Unknown'), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY a.country ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findCountryDistributionByUrlId(@Param("urlId") Long urlId);

    @Query("SELECT new com.urlshortener.dto.ChartDataPoint(COALESCE(a.referrer, 'Direct'), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY a.referrer ORDER BY COUNT(a.id) DESC")
    List<ChartDataPoint> findReferrerDistributionByUrlId(@Param("urlId") Long urlId);

    // Timeline queries
    @Query("SELECT new com.urlshortener.dto.DateDataPoint(CAST(a.visitedAt AS LocalDate), COUNT(a.id)) FROM Analytics a GROUP BY CAST(a.visitedAt AS LocalDate) ORDER BY CAST(a.visitedAt AS LocalDate) ASC")
    List<DateDataPoint> findGlobalDailyClicks();

    @Query("SELECT new com.urlshortener.dto.DateDataPoint(CAST(a.visitedAt AS LocalDate), COUNT(a.id)) FROM Analytics a WHERE a.url.id = :urlId GROUP BY CAST(a.visitedAt AS LocalDate) ORDER BY CAST(a.visitedAt AS LocalDate) ASC")
    List<DateDataPoint> findDailyClicksByUrlId(@Param("urlId") Long urlId);
}
