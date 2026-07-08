package com.urlshortener.service;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeoIpService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final SecureRandom random = new SecureRandom();

    // Reusable mock lists for local/private IPs to make local testing charts look amazing
    private static final List<Location> MOCK_LOCATIONS = List.of(
            new Location("United States", "San Francisco"),
            new Location("United States", "New York"),
            new Location("United Kingdom", "London"),
            new Location("Germany", "Berlin"),
            new Location("India", "Bangalore"),
            new Location("Singapore", "Singapore"),
            new Location("Japan", "Tokyo"),
            new Location("Canada", "Toronto"),
            new Location("Australia", "Sydney"),
            new Location("France", "Paris")
    );

    @Getter
    @Setter
    @ToString
    public static class Location {
        private String country;
        private String city;

        public Location(String country, String city) {
            this.country = country;
            this.city = city;
        }
    }

    public Location resolveIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank() || isPrivateOrLocal(ipAddress)) {
            // Mock dynamic locations for local testing
            Location mockLoc = MOCK_LOCATIONS.get(random.nextInt(MOCK_LOCATIONS.size()));
            log.debug("Local or private IP {} resolved to mock location: {}", ipAddress, mockLoc);
            return mockLoc;
        }

        try {
            String url = "http://ip-api.com/json/" + ipAddress;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "success".equals(response.get("status"))) {
                String country = (String) response.getOrDefault("country", "Unknown");
                String city = (String) response.getOrDefault("city", "Unknown");
                log.info("IP {} resolved to {}, {}", ipAddress, city, country);
                return new Location(country, city);
            }
        } catch (Exception e) {
            log.error("Failed to resolve IP {} using GeoIP API: {}", ipAddress, e.getMessage());
        }

        // Fallback in case of API failure or rate limiting
        return new Location("Unknown", "Unknown");
    }

    private boolean isPrivateOrLocal(String ip) {
        return ip.equals("127.0.0.1") || 
               ip.equals("0:0:0:0:0:0:0:1") || 
               ip.startsWith("10.") || 
               ip.startsWith("192.168.") || 
               ip.startsWith("172.1") || // Simplified check for 172.16.x.x - 172.31.x.x
               ip.startsWith("172.2") ||
               ip.startsWith("172.3");
    }
}
