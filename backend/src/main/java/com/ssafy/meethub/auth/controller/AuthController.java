package com.ssafy.meethub.auth.controller;

import com.ssafy.meethub.auth.dto.request.CheckEmailRequest;
import com.ssafy.meethub.auth.dto.request.ModifyPasswordRequest;
import com.ssafy.meethub.auth.dto.request.SigninRequest;
import com.ssafy.meethub.auth.dto.request.SignupRequest;
import com.ssafy.meethub.auth.dto.response.ReissuanceTokenResponse;
import com.ssafy.meethub.auth.dto.response.SigninResponse;
import com.ssafy.meethub.auth.service.AuthService;
import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthService authService;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    @Override
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(
            @Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("회원 가입이 완료되었습니다."));
    }

    @Override
    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<SigninResponse>> signin(
            @Valid @RequestBody SigninRequest request,
            HttpServletResponse response) {
        // 로그인 처리
        SigninResponse signinResponse = authService.signin(request);

        // Refresh Token을 httpOnly 쿠키로 전달
        String refreshToken = authService.getRefreshToken(
                authService.getUserIdFromAccessToken(signinResponse.accessToken()));
        Cookie refreshTokenCookie = createRefreshTokenCookie(refreshToken);
        response.addCookie(refreshTokenCookie);

        // Access Token은 응답 본문으로 전달
        return ResponseEntity.ok(ApiResponse.success("로그인에 성공하였습니다.", signinResponse));
    }

    @Override
    @PostMapping("/signout")
    public ResponseEntity<ApiResponse<Void>> signout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request,
            HttpServletResponse response) {
        String email = userDetails.getEmail();

        // Access Token 추출 및 블랙리스트 등록, Redis에서 Refresh Token 삭제
        String accessToken = extractToken(request);
        authService.signout(userDetails.getUserId(), accessToken);

        // Refresh Token 쿠키 무효화
        Cookie cookie = createExpiredRefreshTokenCookie();
        response.addCookie(cookie);

        return ResponseEntity.ok(ApiResponse.success("로그아웃이 완료되었습니다."));
    }

    @Override
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<ReissuanceTokenResponse>> reissuanceToken(
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {
        // 기존 Access Token 추출
        String oldAccessToken = extractToken(request);

        ReissuanceTokenResponse reissuanceTokenResponse = authService.reissuanceToken(refreshToken, oldAccessToken);

        String newRefreshToken = authService.getRefreshToken(
                authService.getUserIdFromAccessToken(reissuanceTokenResponse.accessToken()));
        Cookie refreshTokenCookie = createRefreshTokenCookie(newRefreshToken);
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(ApiResponse.success("토큰이 재발급되었습니다.", reissuanceTokenResponse));
    }

    @Override
    @PostMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(
            @Valid @RequestBody CheckEmailRequest request) {
        Boolean response = authService.isDuplicatedEmail(request.email());
        return ResponseEntity.ok(ApiResponse.success("이메일 중복 검증이 완료되었습니다.", response));
    }

    @Override
    @PostMapping("/password")
    public ResponseEntity<ApiResponse<Void>> modifyPassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ModifyPasswordRequest request) {
        authService.modifyPassword(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("비밀번호 변경이 완료되었습니다."));
    }

    private Cookie createRefreshTokenCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);  // HTTPS 환경에서만 전송
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshTokenValidity / 1000));  // 밀리초를 초로 변환
        return cookie;
    }

    private Cookie createExpiredRefreshTokenCookie() {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);  // 즉시 만료
        return cookie;
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
