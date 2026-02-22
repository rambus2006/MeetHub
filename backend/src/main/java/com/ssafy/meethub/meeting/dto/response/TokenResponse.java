package com.ssafy.meethub.meeting.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "LiveKit 토큰 응답")
public record TokenResponse(
        @Schema(description = "방 고유 ID", example = "rm-abc123def456")
        String roomId,

        @Schema(description = "방 표시 이름", example = "팀 미팅")
        String displayName,

        @Schema(description = "방 호스트 id")
        Long hostId,

        @Schema(description = "LiveKit 서버 URL", example = "wss://meethub-dev.livekit.cloud")
        String serverUrl,

        @Schema(description = "LiveKit 접속 토큰", example = "eyJhbGciOiJIUzI1...")
        String token
) {
}
