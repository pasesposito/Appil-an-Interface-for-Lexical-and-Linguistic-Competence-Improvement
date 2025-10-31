package com.appil.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;


@Configuration
@EnableWebSecurity
@EnableAsync
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	    http
	        .csrf(csrf -> csrf
	                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) 
	             )
	        .authorizeHttpRequests(authz -> authz
	            .requestMatchers("/login", "/privacypolicy", "/terms", "/footer", "/registration", "/static/**", "/css/**", "/js/**", "/fontawesome-free-6.6.0-web/**")
	                .permitAll() // Allow access to these pages for everyone
	            .requestMatchers("/admindashboard/**", "/admindashboard/confirm-user/**")
	                .hasRole("ADMIN") // Restrict access to /admindashboard/** and /admindashboard/confirm-user/** to ADMIN role
	            .anyRequest()
	                .authenticated() // All other requests require authentication
	        )
	        .formLogin(form -> form
	                .loginPage("/login")
	                .loginProcessingUrl("/login")  // Ensure this matches the form action
	                .usernameParameter("emailId")
	                .passwordParameter("pwd")
	                .defaultSuccessUrl("/home", true)
	                .permitAll()
	                .failureUrl("/login-error")
	        )
	        .logout(logout -> logout
	            .logoutUrl("/logout") // The URL to trigger logout
	            .logoutSuccessUrl("/login?logout") // Redirect after logout
	            .invalidateHttpSession(true) // Invalidate the HTTP session
	            .deleteCookies("JSESSIONID") // Delete cookies
	            .permitAll()
	        );

	    return http.build();
	}


    
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
   
   
  
}
