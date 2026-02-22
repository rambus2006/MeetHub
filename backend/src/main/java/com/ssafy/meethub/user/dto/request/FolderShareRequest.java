package com.ssafy.meethub.user.dto.request;

import com.ssafy.meethub.common.domain.Permission;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FolderShareRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email
        String email,

        @NotNull(message = "권한 종류는 필수입니다.")
        Permission permission
) {
}
