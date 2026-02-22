package com.ssafy.meethub.report.dto.response;

import com.ssafy.meethub.report.entity.Report;
import com.ssafy.meethub.report.vo.Summary;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
@Schema(description = "회의록 상세 조회 응답")
public record ReportResponse(
        @Schema(description = "회의록 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "회의록 이름", requiredMode = RequiredMode.REQUIRED)
        String name,
        @Schema(description = "영상 길이(초)", requiredMode = RequiredMode.REQUIRED)
        Integer duration,
        @Schema(description = "S3 영상 경로", requiredMode = RequiredMode.REQUIRED)
        String videoUrl,
        @Schema(description = "AI 요약, 키워드", requiredMode = RequiredMode.REQUIRED)
        Summary summary,
        @Schema(description = "생성일자", requiredMode = RequiredMode.REQUIRED)
        LocalDateTime createdAt
) {
    public static ReportResponse from(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .name(report.getName())
                .duration(report.getDuration())
                .videoUrl(report.getVideoPath())
                .summary(report.getSummary())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
