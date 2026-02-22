package com.ssafy.meethub.meeting.controller;

import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import com.ssafy.meethub.meeting.dto.request.CreateRoomRequest;
import com.ssafy.meethub.meeting.dto.request.JoinRoomRequest;
import com.ssafy.meethub.meeting.dto.response.TokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Meeting", description = "회의실 API")
public interface MeetingApi {

    @Operation(
            summary = "방 생성",
            description = "새로운 회의실을 생성하고 호스트 토큰을 반환합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "방 생성 성공"
            )
    })
    @PostMapping
    ResponseEntity<ApiResponse<TokenResponse>> createRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateRoomRequest request
    );

    @Operation(
            summary = "방 입장",
            description = "기존 회의실에 입장하여 참가자 토큰을 받습니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "방 입장 성공"
            )
    })
    @PostMapping("/join")
    ResponseEntity<ApiResponse<TokenResponse>> joinRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JoinRoomRequest request
    );
}
