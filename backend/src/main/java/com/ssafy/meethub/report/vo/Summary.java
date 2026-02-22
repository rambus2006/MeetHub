package com.ssafy.meethub.report.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회의록 요약/키워드")
public class Summary {

    @Schema(description = "회의록 키워드 목록")
    @NotNull(message = "키워드를 입력해주세요.")
    private List<String> keyword;

    @Schema(description = "회의록 요약 내용")
    @NotBlank(message = "요약 내용을 입력해주세요.")
    private String content;
}
