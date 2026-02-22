package com.ssafy.meethub.user.exception;

import com.ssafy.meethub.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {
    DUPLICATE_EMAIL("U001", "중복된 이메일입니다.", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD("U002", "비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),
    NOT_FOUND_USER("U003", "존재하지 않는 사용자입니다.", HttpStatus.NOT_FOUND),
    FOLDER_NOT_FOUND("U100", "폴더를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ALREADY_EXISTS_ROOT_FOLDER("U101", "루트 폴더가 이미 존재합니다.", HttpStatus.BAD_REQUEST),
    EXCEED_MAX_DEPTH_LIMIT("U102", "폴더의 깊이가 제한을 초과했습니다.", HttpStatus.BAD_REQUEST),
    NOT_FOUND_PARENT_FOLDER("U103", "부모 폴더가 존재하지 않습니다.", HttpStatus.BAD_REQUEST),
    DUPLICATE_PERMISSION("U104", "권한이 중복됩니다.", HttpStatus.BAD_REQUEST),
    CANNOT_BE_ANCESTOR_OF_TARGET("U105", "옮기려는 폴더의 하위 항목에는 타겟 폴더가 있을 수 없습니다.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
