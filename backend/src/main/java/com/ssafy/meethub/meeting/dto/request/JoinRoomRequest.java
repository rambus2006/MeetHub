package com.ssafy.meethub.meeting.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "방 입장 요청")
public record JoinRoomRequest(

        @Schema(description = "방 고유 아이디")
        @NotBlank(message = "방 이름은 필수입니다.")
        String roomId,

        @Schema(description = "방 비밀번호", example = "1234")
        String password
) {
}
