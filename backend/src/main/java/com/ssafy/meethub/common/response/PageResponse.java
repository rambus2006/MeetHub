package com.ssafy.meethub.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(

        @Schema(description = "데이터 목록")
        List<T> content,

        @Schema(description = "현재 페이지 번호 (1부터 시작)", example = "1")
        int currentPage,

        @Schema(description = "페이지 크기")
        int pageSize,

        @Schema(description = "전체 데이터 개수")
        long totalElements,

        @Schema(description = "전체 페이지 수")
        int totalPages,

        @Schema(description = "첫 페이지 여부")
        boolean first,

        @Schema(description = "마지막 페이지 여부")
        boolean last
) {
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
