package com.ssafy.meethub.auth.dto.response;

public record SigninResponse(
        Long userId,
        String accessToken,
        String tokenType,
        Long expiresIn
) {
}
