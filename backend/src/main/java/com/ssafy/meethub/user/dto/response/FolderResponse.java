package com.ssafy.meethub.user.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record FolderResponse(
        Long id,
        Long parentId,
        String name,
        LocalDateTime createdAt
) {
}
