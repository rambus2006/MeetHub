package com.ssafy.meethub.report.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "스크립트 수정 요청")
public record UpdateScriptRequest(
        @NotBlank(message = "스크립트 내용을 입력해주세요.")
        String content
) {
}
