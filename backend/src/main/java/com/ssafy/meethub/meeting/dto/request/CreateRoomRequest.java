package com.ssafy.meethub.meeting.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "방 생성 요청")
public record CreateRoomRequest(

        @Schema(description = "방 이름", example = "화상회의")
        @NotBlank(message = "방 이름은 필수입니다.")
        @Size(min = 1, max = 50, message = "방 이름은 1자 이상 50자 이하여야 합니다.")
        String displayName,

        @Schema(description = "방 비밀번호", example = "1234")
        String password
) {
}
