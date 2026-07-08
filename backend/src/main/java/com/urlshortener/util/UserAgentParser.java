package com.urlshortener.util;

import lombok.Getter;
import lombok.ToString;

public class UserAgentParser {

    @Getter
    @ToString
    public static class UserAgentInfo {
        private final String browser;
        private final String operatingSystem;
        private final String device;
        private final String platform;

        public UserAgentInfo(String browser, String operatingSystem, String device, String platform) {
            this.browser = browser;
            this.operatingSystem = operatingSystem;
            this.device = device;
            this.platform = platform;
        }
    }

    public static UserAgentInfo parse(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return new UserAgentInfo("Unknown", "Unknown", "Desktop", "Unknown");
        }

        String browser = parseBrowser(userAgent);
        String os = parseOS(userAgent);
        String device = parseDevice(userAgent);
        String platform = parsePlatform(userAgent);

        return new UserAgentInfo(browser, os, device, platform);
    }

    private static String parseBrowser(String ua) {
        String lower = ua.toLowerCase();
        if (lower.contains("edg/")) {
            return "Microsoft Edge";
        } else if (lower.contains("opr/") || lower.contains("opera")) {
            return "Opera";
        } else if (lower.contains("chrome") && !lower.contains("chromium")) {
            return "Google Chrome";
        } else if (lower.contains("firefox")) {
            return "Mozilla Firefox";
        } else if (lower.contains("safari") && lower.contains("version/")) {
            return "Safari";
        } else if (lower.contains("msie") || lower.contains("trident/")) {
            return "Internet Explorer";
        }
        return "Other";
    }

    private static String parseOS(String ua) {
        if (ua.contains("Windows NT 10.0")) return "Windows 10/11";
        if (ua.contains("Windows NT 6.3")) return "Windows 8.1";
        if (ua.contains("Windows NT 6.2")) return "Windows 8";
        if (ua.contains("Windows NT 6.1")) return "Windows 7";
        if (ua.contains("Android")) return "Android";
        if (ua.contains("iPhone")) return "iOS (iPhone)";
        if (ua.contains("iPad")) return "iOS (iPad)";
        if (ua.contains("Macintosh") || ua.contains("Mac OS X")) return "macOS";
        if (ua.contains("Linux")) return "Linux";
        return "Unknown";
    }

    private static String parseDevice(String ua) {
        String lower = ua.toLowerCase();
        if (lower.contains("ipad") || (lower.contains("android") && !lower.contains("mobile"))) {
            return "Tablet";
        }
        if (lower.contains("mobi") || lower.contains("iphone") || lower.contains("ipod")) {
            return "Mobile";
        }
        return "Desktop";
    }

    private static String parsePlatform(String ua) {
        if (ua.contains("Win64") || ua.contains("x64")) return "64-bit Windows";
        if (ua.contains("WOW64")) return "32-bit Windows on 64-bit OS";
        if (ua.contains("Macintosh")) return "Macintosh";
        if (ua.contains("Linux x86_64")) return "64-bit Linux";
        if (ua.contains("Android")) return "Android Platform";
        if (ua.contains("iPhone")) return "iPhone Platform";
        return "Other";
    }
}
