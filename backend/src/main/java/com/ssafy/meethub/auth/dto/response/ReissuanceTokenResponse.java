package com.ssafy.meethub.auth.dto.response;

public record ReissuanceTokenResponse(
        String accessToken,
        String tokenType,
        Long expiresIn
) {
}
