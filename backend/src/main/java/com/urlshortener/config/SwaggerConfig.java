package com.urlshortener.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI urlShortenerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SaaS URL Shortener API")
                        .description("Production-ready, highly scalable URL shortener with real-time browser, OS, and country analytics.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("API Support")
                                .email("support@urlshortener.com")));
    }
}
