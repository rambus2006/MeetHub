package com.ssafy.meethub.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FileNameUpdateRequest(
        @NotBlank(message = "파일 이름은 필수입니다.")
        @Size(max = 255)
        String name
) {
}
