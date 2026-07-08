package com.urlshortener.repository;

import com.urlshortener.entity.Url;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    Optional<Url> findByShortCode(String shortCode);

    Optional<Url> findByCustomAlias(String customAlias);

    boolean existsByShortCode(String shortCode);

    boolean existsByCustomAlias(String customAlias);

    @Query("SELECT u FROM Url u WHERE u.shortCode = :code OR u.customAlias = :code")
    Optional<Url> findByShortCodeOrCustomAlias(@Param("code") String code);

    Page<Url> findByOriginalUrlContainingIgnoreCaseOrNotesContainingIgnoreCaseOrShortCodeContainingIgnoreCase(
            String originalUrl, String notes, String shortCode, Pageable pageable);

    @Query("SELECT COALESCE(SUM(u.clickCount), 0) FROM Url u")
    long sumTotalClicks();

    @Query("SELECT COUNT(u) FROM Url u WHERE (u.expiresAt IS NULL OR u.expiresAt > :now) AND (u.maxClicks IS NULL OR u.clickCount < u.maxClicks)")
    long countActiveUrls(@Param("now") LocalDateTime now);
}
