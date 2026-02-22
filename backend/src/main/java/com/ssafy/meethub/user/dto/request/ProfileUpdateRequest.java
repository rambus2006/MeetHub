package com.ssafy.meethub.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 30)
        String name
) {
}
