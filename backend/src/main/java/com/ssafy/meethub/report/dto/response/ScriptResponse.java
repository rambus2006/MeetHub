package com.ssafy.meethub.report.dto.response;

import com.ssafy.meethub.report.entity.Script;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import lombok.Builder;

@Builder
@Schema(description = "스크립트 조회 응답")
public record ScriptResponse(
        @Schema(description = "스크립트 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "발언자", requiredMode = RequiredMode.REQUIRED)
        String speaker,
        @Schema(description = "스크립트 내용", requiredMode = RequiredMode.REQUIRED)
        String content,
        @Schema(description = "영상 시작 위치(초)", requiredMode = RequiredMode.REQUIRED)
        Integer startTime,
        @Schema(description = "영상 종료 위치(초)", requiredMode = RequiredMode.REQUIRED)
        Integer endTime,
        @Schema(description = "댓글 여부", requiredMode = RequiredMode.REQUIRED)
        Boolean hasComments
) {
    public static ScriptResponse from(Script script, Boolean hasComments) {
        return ScriptResponse.builder()
                .id(script.getId())
                .speaker(script.getSpeaker())
                .content(script.getContent())
                .startTime(script.getStartTime())
                .endTime(script.getEndTime())
                .hasComments(hasComments)
                .build();
    }
}
