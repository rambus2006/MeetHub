package com.ssafy.meethub.report.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "댓글 생성 요청")
public record CommentRequest(
        @NotBlank(message = "댓글 내용을 입력해주세요.")
        String content
) {
}
