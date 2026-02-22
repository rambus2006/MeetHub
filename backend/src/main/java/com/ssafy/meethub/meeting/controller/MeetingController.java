package com.ssafy.meethub.meeting.controller;

import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import com.ssafy.meethub.meeting.dto.request.CreateRoomRequest;
import com.ssafy.meethub.meeting.dto.request.JoinRoomRequest;
import com.ssafy.meethub.meeting.dto.response.TokenResponse;
import com.ssafy.meethub.meeting.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
@Slf4j
public class MeetingController implements MeetingApi {

    private final MeetingService meetingService;

    @Override
    @PostMapping
    public ResponseEntity<ApiResponse<TokenResponse>> createRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateRoomRequest request
    ) {
        TokenResponse response = meetingService.createRoom(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("방이 생성되었습니다.", response));
    }

    @Override
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<TokenResponse>> joinRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JoinRoomRequest request
    ) {
        TokenResponse response = meetingService.joinRoom(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("방에 입장되었습니다.", response));
    }
}
