package com.ssafy.meethub.user.dto.response;

import lombok.Builder;

@Builder
public record ProfileResponse(
        String email,
        String name
) {
}
