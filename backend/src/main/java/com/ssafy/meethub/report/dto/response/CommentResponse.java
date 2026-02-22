package com.ssafy.meethub.report.dto.response;

import com.ssafy.meethub.report.entity.Comment;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
@Schema(description = "댓글 조회 응답")
public record CommentResponse(
        @Schema(description = "댓글 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long id,
        @Schema(description = "사용자 고유 ID", requiredMode = RequiredMode.REQUIRED)
        Long userId,
        @Schema(description = "사용자 이름", requiredMode = RequiredMode.REQUIRED)
        String userName,
        @Schema(description = "해결 여부", requiredMode = RequiredMode.REQUIRED)
        Boolean isSolved,
        @Schema(description = "댓글 내용", requiredMode = RequiredMode.REQUIRED)
        String content,
        @Schema(description = "생성일자", requiredMode = RequiredMode.REQUIRED)
        LocalDateTime createdAt,
        @Schema(description = "수정일자", requiredMode = RequiredMode.REQUIRED)
        LocalDateTime updatedAt
) {
    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .isSolved(comment.getIsSolved())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
