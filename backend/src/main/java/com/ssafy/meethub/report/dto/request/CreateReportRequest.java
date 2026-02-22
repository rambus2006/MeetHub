package com.ssafy.meethub.report.dto.request;

import com.ssafy.meethub.report.vo.Summary;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "회의록 생성 요청")
public record CreateReportRequest(
        @NotBlank(message = "미팅룸 고유 ID를 입력해주세요")
        String roomId,

        @NotBlank(message = "에이전트 고유 ID를 입력해주세요")
        String agentDispatchId,

        @Valid
        @NotNull(message = "요약 내용을 입력해주세요")
        Summary summary,

        @NotNull(message = "영상 길이를 입력해주세요")
        Integer duration,

        @NotBlank(message = "영상 경로를 입력해주세요")
        String videoPath
) {
}
