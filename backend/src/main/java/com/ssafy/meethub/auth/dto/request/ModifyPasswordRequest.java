package com.ssafy.meethub.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ModifyPasswordRequest(
        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,30}$",
                message = "비밀번호는 문자+숫자+특수문자 포함 8자 이상 30자 이하여야 합니다.")
        @JsonProperty("current_password")
        String currentPassword,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,30}$",
                message = "비밀번호는 문자+숫자+특수문자 포함 8자 이상 30자 이하여야 합니다.")
        @JsonProperty("new_password")
        String newPassword
) {
}
