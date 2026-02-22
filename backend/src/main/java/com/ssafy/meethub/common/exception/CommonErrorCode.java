package com.ssafy.meethub.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommonErrorCode implements ErrorCode {

	INTERNAL_SERVER_ERROR("C001", "서버 내부 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
	INVALID_INPUT("C002", "잘못된 입력값입니다.", HttpStatus.BAD_REQUEST),
	UNAUTHORIZED("C003", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED),
	FORBIDDEN("C004", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
	NOT_FOUND("C005", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	METHOD_NOT_ALLOWED("C006", "허용되지 않은 HTTP 메소드입니다.", HttpStatus.METHOD_NOT_ALLOWED),
	VALIDATION_FAILED("C100", "데이터 검증에 실패했습니다.", HttpStatus.BAD_REQUEST),
	MISSING_REQUIRED_FIELD("C101", "필수 입력값이 누락되었습니다.", HttpStatus.BAD_REQUEST),
	INVALID_FORMAT("C102", "잘못된 형식입니다.", HttpStatus.BAD_REQUEST),
	INVALID_JSON_FORMAT("C103", "JSON 형식이 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
	CONTENT_SERIALIZE_FAILED("C104", "JSON 직렬화에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
	CONTENT_DESERIALIZE_FAILED("C105", "JSON 역직렬화에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

	private final String code;
	private final String message;
	private final HttpStatus httpStatus;
}
