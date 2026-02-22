package com.ssafy.meethub.report.dto.request;

import com.ssafy.meethub.report.vo.Summary;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Schema(description = "회의록 요약/키워드 수정 요청")
public record UpdateReportRequest(
        @Valid
        @NotNull(message = "요약 내용을 입력해주세요.")
        Summary summary
) {
}
