package com.ssafy.meethub.report.dto.response;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.report.entity.ReportShare;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import lombok.Builder;

@Builder
@Schema(description = "회의록 권한 목록 조회 응답")
public record ReportPermissionResponse(
        @Schema(description = "회의록 권한 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "사용자 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long userId,
        @Schema(description = "사용자 이름", requiredMode = RequiredMode.REQUIRED)
        String userName,
        @Schema(description = "회의록 권한", requiredMode = RequiredMode.REQUIRED)
        Permission permission
) {
    public static ReportPermissionResponse from(ReportShare reportShare) {
        return ReportPermissionResponse.builder()
                .id(reportShare.getId())
                .userId(reportShare.getUser().getId())
                .userName(reportShare.getUser().getName())
                .permission(reportShare.getPermission())
                .build();
    }
}
