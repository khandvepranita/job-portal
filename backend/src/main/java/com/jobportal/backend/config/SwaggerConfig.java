package com.jobportal.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Job Portal Enterprise API")
                        .version("1.0.0")
                        .description("Spring Boot REST API with JWT Authentication, Security, DTOs, Soft Delete & Auditing")
                        .contact(new Contact().name("Job Portal Support").email("support@jobportal.com"))
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
