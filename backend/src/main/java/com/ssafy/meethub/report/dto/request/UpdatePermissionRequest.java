package com.ssafy.meethub.report.dto.request;

import com.ssafy.meethub.common.domain.Permission;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "회의록 권한 수정 요청")
public record UpdatePermissionRequest(
        @NotNull(message = "권한을 입력해주세요.")
        Permission permission
) {
}
