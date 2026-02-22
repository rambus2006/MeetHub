package com.ssafy.meethub.auth.controller;

import com.ssafy.meethub.auth.dto.request.CheckEmailRequest;
import com.ssafy.meethub.auth.dto.request.ModifyPasswordRequest;
import com.ssafy.meethub.auth.dto.request.SigninRequest;
import com.ssafy.meethub.auth.dto.request.SignupRequest;
import com.ssafy.meethub.auth.dto.response.ReissuanceTokenResponse;
import com.ssafy.meethub.auth.dto.response.SigninResponse;
import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "인증", description = "사용자 인증 및 토큰 관리 API")
public interface AuthApi {

    @Operation(
            summary = "회원 가입 API",
            description = "새로운 사용자를 등록합니다."
    )
    ResponseEntity<ApiResponse<Void>> signup(
            @Valid @RequestBody SignupRequest request);

    @Operation(
            summary = "로그인 API",
            description = "사용자의 로그인을 처리합니다. Refresh Token은 httpOnly 쿠키로 전달됩니다."
    )
    ResponseEntity<ApiResponse<SigninResponse>> signin(
            @Valid @RequestBody SigninRequest request,
            HttpServletResponse response);

    @Operation(
            summary = "로그아웃 API",
            description = "사용자의 로그아웃을 처리합니다. Refresh Token 쿠키를 무효화합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> signout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request,
            HttpServletResponse response);

    @Operation(
            summary = "토큰 재발급 API",
            description = "토큰을 재발급합니다."
    )
    ResponseEntity<ApiResponse<ReissuanceTokenResponse>> reissuanceToken(
            @CookieValue(name = "refreshToken") @Parameter(hidden = true) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response);

    @Operation(
            summary = "이메일 중복 여부 검증 API",
            description = "이메일의 중복 여부를 검증합니다."
    )
    ResponseEntity<ApiResponse<Boolean>> checkEmail(@Valid @RequestBody CheckEmailRequest request);

    @Operation(
            summary = "비밀번호 변경 API",
            description = "사용자의 비밀번호를 변경합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> modifyPassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ModifyPasswordRequest request);
}
