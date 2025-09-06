package com.stjoseph.assessmentsystem.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.stjoseph.assessmentsystem.security.JwtAuthenticationEntryPoint;
import com.stjoseph.assessmentsystem.security.JwtAuthenticationFilter;
import com.stjoseph.assessmentsystem.service.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;
    
    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/jobs").permitAll()
                .requestMatchers(HttpMethod.GET, "/jobs/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/jobs/{id}").permitAll()
                .requestMatchers(HttpMethod.POST, "/jobs").hasAuthority("ROLE_ALUMNI")
                .requestMatchers(HttpMethod.PUT, "/jobs/**").hasAuthority("ROLE_ALUMNI")
                .requestMatchers(HttpMethod.DELETE, "/jobs/**").hasAuthority("ROLE_ALUMNI")
                .requestMatchers(HttpMethod.GET, "/jobs/my-jobs").hasAuthority("ROLE_ALUMNI")
                .requestMatchers(HttpMethod.GET, "/users/alumni-directory").permitAll()
                .requestMatchers(HttpMethod.GET, "/events/test").permitAll()
                .requestMatchers(HttpMethod.GET, "/alumni-directory/test").permitAll()
                .requestMatchers(HttpMethod.GET, "/debug/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/alumni-directory/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/approved").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers("/api/alumni-events/**").hasAnyAuthority("ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers("/api/management-events/**").hasAuthority("ROLE_MANAGEMENT")
                .requestMatchers("/api/alumni-network/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers("/management/**").hasAuthority("ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/alumni/profile/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/students/profile/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/professors/profile/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/assessments/search-students").hasAnyAuthority("ROLE_PROFESSOR", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/management/students/search").hasAuthority("ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/activities/heatmap/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.GET, "/activities/user/**").hasAnyAuthority("ROLE_PROFESSOR", "ROLE_MANAGEMENT")
                .requestMatchers("/attendance/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_MANAGEMENT")
                .requestMatchers("/alumni/**").hasAuthority("ROLE_ALUMNI")
                .requestMatchers("/connections/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .anyRequest().hasAnyAuthority("ROLE_STUDENT", "ROLE_PROFESSOR", "ROLE_ALUMNI", "ROLE_MANAGEMENT")
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}


