package com.ssafy.meethub.common.security;

import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.user.exception.UserErrorCode;
import com.ssafy.meethub.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token != null) {
                authenticateToken(token, request);
            }
        } catch (Exception e) {
            logger.error("JWT 인증 실패", e);
        }
        filterChain.doFilter(request, response);
    }

    private void authenticateToken(String token, HttpServletRequest request) {
        if (!isValidToken(token)) {
            return;
        }

        Long userId = jwtTokenProvider.getUserId(token);
        validateUser(userId);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(Long.toString(userId));
        setAuthentication(userDetails, request);
    }

    private boolean isValidToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            return false;
        }
        if (jwtTokenProvider.isBlacklisted(token)) {
            logger.warn("Blacklisted token attempted to authenticate");
            return false;
        }
        return true;
    }

    private void validateUser(Long userId) {
        if (!userRepository.existsByIdAndIsDeletedFalse(userId)) {
            throw new BusinessException(UserErrorCode.NOT_FOUND_USER);
        }
    }

    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
