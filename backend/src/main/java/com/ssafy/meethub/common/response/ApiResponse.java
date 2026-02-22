package com.ssafy.meethub.common.response;

import com.ssafy.meethub.common.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	private final boolean success;
	private final String message;
	private final T content;
	private final String errorCode;

	private ApiResponse(boolean success, String message, T content) {
		this.success = success;
		this.message = message;
		this.content = content;
		this.errorCode = null;
	}

	private ApiResponse(boolean success, String message, String errorCode) {
		this.success = success;
		this.message = message;
		this.content = null;
		this.errorCode = errorCode;
	}

	public static <T> ApiResponse<T> success(String message, T content) {
		return new ApiResponse<>(true, message, content);
	}

	public static <T> ApiResponse<T> success(String message) {
		return new ApiResponse<>(true, message, null);
	}

	public static <T> ApiResponse<T> failure(String message, String errorCode) {
		return new ApiResponse<>(false, message, errorCode);
	}

	public static <T> ApiResponse<T> failure(ErrorCode ec) {
		return new ApiResponse<>(false, ec.getMessage(), ec.getCode());
	}

	public static <T> ApiResponse<T> failure(String message) {
		return new ApiResponse<>(false, message, null);
	}
}
