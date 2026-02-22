package com.ssafy.meethub.report.exception;

import com.ssafy.meethub.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ReportErrorCode implements ErrorCode {

    ROOM_ACCESS_DENIED("R010", "요청하신 방을 찾을 수 없거나 회의록 생성 권한이 없습니다.", HttpStatus.NOT_FOUND),
    REPORT_NOT_FOUND("R001", "회의록을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    NOT_REPORT_OWNER("R002", "회의록의 작성자가 아닙니다.", HttpStatus.FORBIDDEN),
    ALREADY_SHARED_REPORT("R003", "이미 공유된 사용자입니다.", HttpStatus.CONFLICT),
    SCRIPT_NOT_FOUND("R101", "스크립트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND("R201", "댓글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    NOT_COMMENT_OWNER("R202", "댓글의 작성자가 아닙니다.", HttpStatus.FORBIDDEN),
    REPORT_PERMISSION_NOT_FOUND("R301", "회의록 권한을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
