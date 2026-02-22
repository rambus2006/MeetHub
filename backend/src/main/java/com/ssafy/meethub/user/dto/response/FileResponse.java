package com.ssafy.meethub.user.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record FileResponse(
        Long id,
        String name,
        LocalDateTime createdAt
) {
}
