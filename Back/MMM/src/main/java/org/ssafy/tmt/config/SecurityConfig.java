package org.ssafy.tmt.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.ssafy.tmt.api.repository.users.SessionRepository;
import org.ssafy.tmt.config.security.CustomAuthenticationEntryPoint;
import org.ssafy.tmt.config.security.CustomUserDetailsService;
import org.ssafy.tmt.filter.SessionValidationFilter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${ALLOWED_IPS}")
    private String allowedIps;

    @Autowired
    private final CustomUserDetailsService userDetailsService;
    private final SessionRepository sessionRepository;
    private final SessionValidationFilter sessionValidationFilter;

    private List<String> getAllowedIps() {
        return Arrays.stream(allowedIps.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        http
                // CSRF 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(sessionValidationFilter, UsernamePasswordAuthenticationFilter.class)
                // 인증 및 권한 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/user/**").permitAll()  // 인증 없이 접근 가능
                        .requestMatchers("/ws-stomp/**").permitAll()
                        .requestMatchers("/actuator/**").access((authentication, context) -> {
                            HttpServletRequest request = context.getRequest();
                            String remoteAddr = request.getRemoteAddr();
                            System.out.println("remoteAddr = " + remoteAddr);

                            for (String ip : getAllowedIps()) {
                                IpAddressMatcher matcher = new IpAddressMatcher(ip);
                                if (matcher.matches(request)) {
                                    return new AuthorizationDecision(true);
                                }
                            }
                            return new AuthorizationDecision(false);
                        })
                        .anyRequest().authenticated()  // 나머지 요청은 인증 필요
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(new CustomAuthenticationEntryPoint()) // 401 반환 설정
                )
                .userDetailsService(userDetailsService)
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 세션 유지
                                .maximumSessions(1) // 최대 세션 수 설정
                                .maxSessionsPreventsLogin(false) // 최대 세션 수 초과 시 로그인 방지 설정
                )
                .securityContext(securityContext ->
                        securityContext.requireExplicitSave(false) // SecurityContext 자동 저장 활성화
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOriginPatterns(Arrays.asList(
//                "http://localhost:3000",
//                "http://localhost:5173",
//                "https://j12c207.p.ssafy.io",
//                "http://j12c207.p.ssafy.io",
//                "http://j12c207.p.ssafy.io:3000",
//                "http://localhost:5174"
//
//        ));
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://j12c207.p.ssafy.io",
                "http://j12c207.p.ssafy.io",
                "http://j12c207.p.ssafy.io:3000",
                "http://localhost:5174",
                "chrome-extension://gobngblklhkgmjhbpbdlkglbhhlafjnh",
                "https://localhost:3000",
                "https://localhost:8443"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // 허용할 HTTP 메서드
        configuration.setAllowedHeaders(List.of("*")); // 허용할 헤더
        configuration.setExposedHeaders(List.of("*")); // 노출할 헤더
        configuration.setAllowCredentials(true); // 인증 정보 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 대해 CORS 설정 적용
        return source;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

