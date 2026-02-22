package com.ssafy.meethub.report.dto.request;

import com.ssafy.meethub.common.domain.Permission;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "회의록 공유 요청")
public record ReportShareRequest(
        @NotBlank(message = "이메일을 입력해주세요.")
        @Email
        String email,

        @NotNull(message = "권한을 입력해주세요.")
        Permission permission
) {
}
