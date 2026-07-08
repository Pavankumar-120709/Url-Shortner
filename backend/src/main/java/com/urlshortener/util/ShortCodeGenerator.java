package com.urlshortener.util;

import java.security.SecureRandom;

public class ShortCodeGenerator {

    private static final String BASE62_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 7;
    private static final SecureRandom random = new SecureRandom();

    public static String generate() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(BASE62_CHARACTERS.length());
            sb.append(BASE62_CHARACTERS.charAt(index));
        }
        return sb.toString();
    }
}
