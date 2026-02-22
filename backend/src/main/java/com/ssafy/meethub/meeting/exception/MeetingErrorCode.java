package com.ssafy.meethub.meeting.exception;

import com.ssafy.meethub.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MeetingErrorCode implements ErrorCode {

    TOKEN_GENERATION_FAILED("M001", "토큰 생성에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_ROOM_NAME("M002", "올바르지 않은 회의실 이름입니다.", HttpStatus.BAD_REQUEST),
    WEBHOOK_VERIFICATION_FAILED("M003", "Webhook 검증에 실패했습니다.",HttpStatus.UNAUTHORIZED),
    ROOM_NOT_FOUND("M004", "존재하지 않는 방입니다.",HttpStatus.NOT_FOUND),
    INVALID_PASSWORD("M005", "비밀번호가 일치하지 않습니다.",HttpStatus.UNAUTHORIZED),
    USER_ALREADY_HAS_ACTIVE_ROOM("M006", "이미 진행중인 회의가 있습니다.",HttpStatus.CONFLICT),
    PYTHON_SERVER_ERROR("M007", "Python 서버 통신에 실패했습니다.",HttpStatus.INTERNAL_SERVER_ERROR),
    ROOM_CREATION_FAILED("M008","방 생성에 실패했습니다." ,HttpStatus.INTERNAL_SERVER_ERROR),
    ROOM_CREATION_TOO_FREQUENT("M009", "잠시 후 다시 시도해주세요.", HttpStatus.TOO_MANY_REQUESTS),
    WEBHOOK_PROCESSING_FAILED("M010", "Webhook 처리에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
