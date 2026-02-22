package com.ssafy.meethub.user.controller;

import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import com.ssafy.meethub.user.dto.request.FileNameUpdateRequest;
import com.ssafy.meethub.user.dto.request.FolderCreateRequest;
import com.ssafy.meethub.user.dto.request.FolderNameUpdateRequest;
import com.ssafy.meethub.user.dto.request.FolderShareRequest;
import com.ssafy.meethub.user.dto.request.ProfileUpdateRequest;
import com.ssafy.meethub.user.dto.request.RelocateItemsRequest;
import com.ssafy.meethub.user.dto.response.FileResponse;
import com.ssafy.meethub.user.dto.response.FolderResponse;
import com.ssafy.meethub.user.dto.response.ProfileResponse;
import com.ssafy.meethub.user.service.FilesystemService;
import com.ssafy.meethub.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/me")
public class UserController implements UserApi {
    private final UserService userService;
    private final FilesystemService filesystemService;

    @Override
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> withdrawal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response) {
        userService.deleteUser(userDetails.getUserId());

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);  // 즉시 만료
        response.addCookie(cookie);

        return ResponseEntity.ok(ApiResponse.success("회원 탈퇴가 완료되었습니다."));
    }

    @Override
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> readProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProfileResponse response = userService.readUser(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("프로필 조회에 성공하였습니다.", response));
    }

    @Override
    @PatchMapping
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileUpdateRequest request) {
        userService.updateUser(userDetails.getUserId(), request.name());
        return ResponseEntity.ok(ApiResponse.success("프로필 수정에 성공하였습니다."));
    }

    @Override
    @PostMapping("/filesystem/folder")
    public ResponseEntity<ApiResponse<Void>> createFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FolderCreateRequest request) {
        filesystemService.createFolder(userDetails.getUserId(), request.parentId(), request.name());
        return ResponseEntity.ok(ApiResponse.success("폴더 생성에 성공하였습니다."));
    }

    @Override
    @PatchMapping("/filesystem/folder/{id}")
    public ResponseEntity<ApiResponse<Void>> modifyFolderName(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FolderNameUpdateRequest request) {
        filesystemService.updateFolderName(userDetails.getUserId(), id, request.name());
        return ResponseEntity.ok(ApiResponse.success("폴더 이름 변경에 성공하였습니다."));
    }

    @Override
    @PatchMapping("/filesystem/file/{id}")
    public ResponseEntity<ApiResponse<Void>> modifyFileName(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FileNameUpdateRequest request) {
        filesystemService.updateFileName(userDetails.getUserId(), id, request.name());
        return ResponseEntity.ok(ApiResponse.success("파일 이름 변경에 성공하였습니다."));
    }

    @Override
    @GetMapping("/filesystem/folder/all")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getFolders(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<FolderResponse> response = filesystemService.readFolders(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("폴더 전체 조회에 성공하였습니다.", response));
    }

    @Override
    @PostMapping("/filesystem/folder/{id}/share")
    public ResponseEntity<ApiResponse<Void>> shareFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FolderShareRequest request) {
        filesystemService.shareFolder(userDetails.getUserId(), id, request.email(), request.permission());
        return ResponseEntity.ok(ApiResponse.success("폴더 공유에 성공하였습니다."));
    }

    @Override
    @GetMapping("/filesystem/folder/{id}/all")
    public ResponseEntity<ApiResponse<List<FileResponse>>> readFiles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        List<FileResponse> response = filesystemService.readFiles(userDetails.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("파일 목록 조회에 성공하였습니다.", response));
    }

    @Override
    @PostMapping("/filesystem/move")
    public ResponseEntity<ApiResponse<Void>> relocateItems(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RelocateItemsRequest request) {
        filesystemService.relocateItems(userDetails.getUserId(), request.targetId(), request.folderRelocationInfos(),
                request.fileRelocationInfos());
        return ResponseEntity.ok(ApiResponse.success("폴더/파일 위치 변경에 성공하였습니다."));
    }

    @Override
    @DeleteMapping("/filesystem/folder/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        filesystemService.deleteFolder(userDetails.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("폴더 삭제에 성공하였습니다."));
    }
}
