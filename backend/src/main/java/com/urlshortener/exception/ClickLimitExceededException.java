package com.urlshortener.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ClickLimitExceededException extends RuntimeException {
    public ClickLimitExceededException(String message) {
        super(message);
    }
}
