package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlRequestDto {

    @NotBlank(message = "Original URL must not be blank")
    @Size(max = 2048, message = "Original URL must be under 2048 characters")
    @org.hibernate.validator.constraints.URL(message = "Must be a valid URL")
    private String originalUrl;

    @Size(max = 50, message = "Custom alias must be under 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9-_]*$", message = "Custom alias must only contain letters, numbers, hyphens, and underscores")
    private String customAlias;

    @Min(value = 1, message = "Maximum clicks limit must be at least 1")
    private Integer maxClicks;

    private LocalDateTime expiresAt;

    private String notes;
}
