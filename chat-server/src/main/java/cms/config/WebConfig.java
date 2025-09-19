package cms.config;

import cms.common.interceptor.ApiKeyAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final ApiKeyAuthInterceptor apiKeyAuthInterceptor;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void configurePathMatch(@NonNull PathMatchConfigurer configurer) {
        configurer
                .addPathPrefix("/api/v1",
                        c -> c.isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
    }

    @Override
    public void configureContentNegotiation(@NonNull ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(false)
                .ignoreAcceptHeader(false)
                .useRegisteredExtensionsOnly(true);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS 설정 활성화 - 프론트엔드(localhost:3000)에서 백엔드(localhost:8080)로의 요청 허용
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:3000", "http://127.0.0.1:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Authorization")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(apiKeyAuthInterceptor)
                .addPathPatterns("/api/v1/external/**");
    }
}
