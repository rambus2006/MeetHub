package com.ssafy.meethub.common.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.ssafy.meethub.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String DEFAULT_VALIDATION_MESSAGE = "입력값이 올바르지 않습니다.";

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException exception) {
        logBusinessException(exception);
        return createErrorResponse(
                exception.getMessage(),
                exception.getErrorCode().getCode(),
                exception.getErrorCode().getHttpStatus()
        );
    }

    @ExceptionHandler({
            AuthorizationDeniedException.class,
            AccessDeniedException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDeniedException(Exception exception) {
        String message = AuthorizationMessageBuilder.build();
        logWarning("Authorization Denied Exception", message);
        return createErrorResponse(message, "A001", HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(NoResourceFoundException exception) {
        logWarning("No Resource Found Exception", exception.getMessage());
        return createErrorResponse(CommonErrorCode.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        String message = extractValidationMessage(exception);
        logWarning("Validation Exception", message);
        return createErrorResponse(message, CommonErrorCode.VALIDATION_FAILED.getCode(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleJsonParseException(HttpMessageNotReadableException exception) {
        String message = JsonParseErrorMessageExtractor.extract(exception);
        logWarning("Json Parse Exception", message);
        return createErrorResponse(message, CommonErrorCode.INVALID_FORMAT.getCode(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Void>> handleBindException(BindException exception) {
        String message = extractBindErrorMessage(exception);
        logWarning("Bind Exception", message);
        return createErrorResponse(message, CommonErrorCode.VALIDATION_FAILED.getCode(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParameterException(
            MissingServletRequestParameterException exception) {
        String message = MissingParameterMessageBuilder.build(exception);
        logWarning("Missing Parameter Exception", message);
        return createErrorResponse(message, CommonErrorCode.MISSING_REQUIRED_FIELD.getCode(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException exception) {
        String message = TypeMismatchMessageBuilder.build(exception);
        logWarning("Type Mismatch Exception", message);
        return createErrorResponse(message, CommonErrorCode.INVALID_FORMAT.getCode(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException exception) {
        logWarning("Method Not Supported Exception", exception.getMessage());
        return createErrorResponse(CommonErrorCode.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception exception) {
        logUnexpectedException(exception);
        return createErrorResponse(CommonErrorCode.INTERNAL_SERVER_ERROR);
    }

    private void logBusinessException(BusinessException exception) {
        log.warn("Business Exception: {} - {}", exception.getErrorCode().getCode(), exception.getMessage());
    }

    private void logWarning(String exceptionType, String message) {
        log.warn("{}: {}", exceptionType, message);
    }

    private void logUnexpectedException(Exception exception) {
        log.error("Unexpected Exception: {} - {}",
                exception.getClass().getSimpleName(),
                exception.getMessage(),
                exception);
    }

    private String extractValidationMessage(MethodArgumentNotValidException exception) {
        FieldError fieldError = exception.getBindingResult().getFieldError();
        return fieldError != null ? fieldError.getDefaultMessage() : DEFAULT_VALIDATION_MESSAGE;
    }

    private String extractBindErrorMessage(BindException exception) {
        FieldError fieldError = exception.getBindingResult().getFieldError();
        return fieldError != null ? fieldError.getDefaultMessage() : DEFAULT_VALIDATION_MESSAGE;
    }

    private ResponseEntity<ApiResponse<Void>> createErrorResponse(ErrorCode errorCode) {
        ApiResponse<Void> response = ApiResponse.failure(errorCode);
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(response);
    }

    private ResponseEntity<ApiResponse<Void>> createErrorResponse(
            String message,
            String errorCodeValue,
            HttpStatus status) {
        ApiResponse<Void> response = ApiResponse.failure(message, errorCodeValue);
        return ResponseEntity
                .status(status)
                .body(response);
    }

    private static class JsonParseErrorMessageExtractor {
        private static final String DEFAULT_MESSAGE = "잘못된 요청 형식입니다.";
        private static final String UNRECOGNIZED_TOKEN_KEYWORD = "Unrecognized token";
        private static final String UNKNOWN_FIELD = "unknown";
        private static final String QUOTE = "'";

        public static String extract(HttpMessageNotReadableException exception) {
            if (!(exception.getCause() instanceof JsonMappingException jsonMapping)) {
                return DEFAULT_MESSAGE;
            }

            String fieldName = extractFieldName(jsonMapping);
            String invalidValue = extractInvalidValue(exception.getMessage());

            if (invalidValue != null) {
                return buildDetailedMessage(fieldName, invalidValue);
            }

            return DEFAULT_MESSAGE;
        }

        private static String extractFieldName(JsonMappingException jsonMapping) {
            if (jsonMapping.getPath().isEmpty()) {
                return UNKNOWN_FIELD;
            }
            String fieldName = jsonMapping.getPath().getFirst().getFieldName();
            return fieldName != null ? fieldName : UNKNOWN_FIELD;
        }

        private static String extractInvalidValue(String originalMessage) {
            if (!originalMessage.contains(UNRECOGNIZED_TOKEN_KEYWORD)) {
                return null;
            }

            int start = originalMessage.indexOf(QUOTE) + 1;
            int end = originalMessage.indexOf(QUOTE, start);

            if (start > 0 && end > start) {
                return originalMessage.substring(start, end);
            }

            return null;
        }

        private static String buildDetailedMessage(String fieldName, String invalidValue) {
            return String.format("'%s' 필드의 값 '%s'이(가) 올바르지 않습니다.", fieldName, invalidValue);
        }
    }

    private static class MissingParameterMessageBuilder {
        private static final String MESSAGE_TEMPLATE = "필수 파라미터가 누락되었습니다: %s";

        public static String build(MissingServletRequestParameterException exception) {
            return String.format(MESSAGE_TEMPLATE, exception.getParameterName());
        }
    }

    private static class TypeMismatchMessageBuilder {
        private static final String MESSAGE_TEMPLATE = "잘못된 파라미터 타입입니다: %s";

        public static String build(MethodArgumentTypeMismatchException exception) {
            return String.format(MESSAGE_TEMPLATE, exception.getName());
        }
    }
    
    private static class AuthorizationMessageBuilder {
        private static final String MESSAGE = "접근 권한이 없습니다.";

        public static String build() {
            return MESSAGE;
        }
    }
}
