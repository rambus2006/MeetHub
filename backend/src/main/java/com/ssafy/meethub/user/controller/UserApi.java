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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "사용자", description = "사용자 정보 및 개인 파일 시스템 관리 API")
public interface UserApi {
    @Operation(
            summary = "회원 탈퇴 API",
            description = "회원 탈퇴를 진행합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> withdrawal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response);

    @Operation(
            summary = "프로필 조회 API",
            description = "사용자 프로필을 조회합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<ProfileResponse>> readProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "프로필 수정 API",
            description = "사용자 정보를 수정합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileUpdateRequest request);

    @Operation(
            summary = "폴더 생성 API",
            description = "사용자 폴더를 생성합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> createFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FolderCreateRequest request);

    @Operation(
            summary = "폴더 이름 변경 API",
            description = "사용자 폴더의 이름을 변경합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> modifyFolderName(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FolderNameUpdateRequest request);

    @Operation(
            summary = "파일 이름 변경 API",
            description = "사용자 파일의 이름을 변경합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> modifyFileName(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FileNameUpdateRequest request);

    @Operation(
            summary = "전체 경로의 폴더 목록 조회 API",
            description = "사용자의 파일 시스템에 존재하는 모든 폴더 목록을 조회합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<List<FolderResponse>>> getFolders(
            @AuthenticationPrincipal CustomUserDetails userDetails);

    @Operation(
            summary = "폴더 공유 API",
            description = "사용자에게 폴더를 공유합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> shareFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FolderShareRequest request);

    @Operation(
            summary = "폴더 내의 파일 목록 조회 API",
            description = "폴더 내에 존재하는 파일 목록을 조회합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<List<FileResponse>>> readFiles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id);

    @Operation(
            summary = "폴더/파일 위치 변경 API",
            description = "폴더와 파일 리스트를 받아서 지정한 폴더 밑으로 옮깁니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> relocateItems(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RelocateItemsRequest request);

    @Operation(
            summary = "폴더 삭제 API",
            description = "폴더를 삭제합니다. 하위의 모든 폴더/파일이 함께 삭제됩니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    ResponseEntity<ApiResponse<Void>> deleteFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id);
}
