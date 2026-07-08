package com.urlshortener.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpResolver {

    public static String resolve(HttpServletRequest request) {
        if (request == null) {
            return "0.0.0.0";
        }
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // If there are multiple IPs in X-Forwarded-For (proxy chain), take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        // Standardize local IPv6 loopback
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        
        return ip;
    }
}
