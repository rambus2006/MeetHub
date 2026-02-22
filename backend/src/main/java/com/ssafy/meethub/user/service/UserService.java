package com.ssafy.meethub.user.service;

import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.common.security.JwtTokenProvider;
import com.ssafy.meethub.user.dto.response.ProfileResponse;
import com.ssafy.meethub.user.entity.User;
import com.ssafy.meethub.user.exception.UserErrorCode;
import com.ssafy.meethub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void createUser(String email, String name, String password) {
        if (userRepository.existsByEmailAndIsDeletedFalse(email)) {
            throw new BusinessException(UserErrorCode.DUPLICATE_EMAIL);
        }

        userRepository.save(User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .build());
    }

    @Transactional(readOnly = true)
    public Boolean isDuplicatedEmail(String email) {
        return userRepository.existsByEmailAndIsDeletedFalse(email);
    }

    @Transactional
    public void modifyPassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(UserErrorCode.INVALID_PASSWORD);
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));
        userRepository.delete(user);
        deleteRefreshTokenByUserId(userId);
    }

    @Transactional
    public void deleteRefreshTokenByUserId(Long userId) {
        jwtTokenProvider.deleteRefreshTokenByUserId(userId);
    }

    @Transactional(readOnly = true)
    public ProfileResponse readUser(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));

        return ProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }

    @Transactional
    public void updateUser(Long userId, String name) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));

        user.updateName(name);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));
    }

    public User getReferenceById(Long userId) {
        return userRepository.getReferenceById(userId);
    }
}
