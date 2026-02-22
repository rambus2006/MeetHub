package com.ssafy.meethub.auth.service;

import com.ssafy.meethub.auth.dto.request.ModifyPasswordRequest;
import com.ssafy.meethub.auth.dto.request.SigninRequest;
import com.ssafy.meethub.auth.dto.request.SignupRequest;
import com.ssafy.meethub.auth.dto.response.ReissuanceTokenResponse;
import com.ssafy.meethub.auth.dto.response.SigninResponse;
import com.ssafy.meethub.auth.exception.AuthErrorCode;
import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.common.security.JwtTokenProvider;
import com.ssafy.meethub.user.entity.User;
import com.ssafy.meethub.user.repository.UserRepository;
import com.ssafy.meethub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Transactional
    public void signup(SignupRequest request) {
        userService.createUser(request.email(), request.name(), request.password());
    }

    @Transactional(readOnly = true)
    public SigninResponse signin(SigninRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.email())
                .orElseThrow(() -> new BusinessException(AuthErrorCode.INVALID_CREDENTIALS));

        if (user.isDeleted()) {
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return new SigninResponse(user.getId(), accessToken, "Bearer", accessTokenValidity / 1000);
    }

    public Long getUserIdFromAccessToken(String accessToken) {
        return jwtTokenProvider.getUserId(accessToken);
    }

    public String getRefreshToken(Long userId) {
        return jwtTokenProvider.getRefreshToken(userId);
    }

    @Transactional
    public void signout(Long userId, String accessToken) {
        // Access Token을 블랙리스트에 추가
        if (accessToken != null && !accessToken.isEmpty()) {
            jwtTokenProvider.addToBlacklist(accessToken);
        }

        // userId로 직접 Refresh Token 삭제
        jwtTokenProvider.deleteRefreshTokenByUserId(userId);
    }

    @Transactional
    public ReissuanceTokenResponse reissuanceToken(String refreshToken, String oldAccessToken) {
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);

        if (oldAccessToken != null && !oldAccessToken.isEmpty()) {
            jwtTokenProvider.addToBlacklist(oldAccessToken);
        }

        jwtTokenProvider.deleteRefreshTokenByUserId(userId);

        String newAccessToken = jwtTokenProvider.createAccessToken(userId);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

        return new ReissuanceTokenResponse(newAccessToken, "Bearer", accessTokenValidity / 1000);
    }

    @Transactional
    public void modifyPassword(Long userId, ModifyPasswordRequest request) {
        userService.modifyPassword(userId, request.currentPassword(), request.newPassword());
    }

    @Transactional(readOnly = true)
    public Boolean isDuplicatedEmail(String email) {
        return userService.isDuplicatedEmail(email);
    }
}
