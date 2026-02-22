package com.ssafy.meethub.report.controller;

import com.ssafy.meethub.common.response.ApiResponse;
import com.ssafy.meethub.common.response.PageResponse;
import com.ssafy.meethub.common.security.CustomUserDetails;
import com.ssafy.meethub.report.dto.request.CommentRequest;
import com.ssafy.meethub.report.dto.request.CreateReportRequest;
import com.ssafy.meethub.report.dto.request.ReportShareRequest;
import com.ssafy.meethub.report.dto.request.UpdatePermissionRequest;
import com.ssafy.meethub.report.dto.request.UpdateReportRequest;
import com.ssafy.meethub.report.dto.request.UpdateScriptRequest;
import com.ssafy.meethub.report.dto.response.CommentResponse;
import com.ssafy.meethub.report.dto.response.ReportPermissionResponse;
import com.ssafy.meethub.report.dto.response.ReportResponse;
import com.ssafy.meethub.report.dto.response.ScriptResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "회의록", description = "회의록 조회 및 관리 API")
public interface ReportApi {

    @Operation(summary = "회의록 생성 API", description = "회의록을 생성합니다.")
    ResponseEntity<ApiResponse<Void>> createReport(
            @Valid @RequestBody CreateReportRequest request);

    @Operation(summary = "회의록 상세 조회 API", description = "회의록을 상세 조회합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId);

    @Operation(summary = "회의록 수정 API", description = "회의록을 수정합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> updateReport(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @Valid @RequestBody UpdateReportRequest request);

    @Operation(summary = "회의록 삭제 API", description = "회의록을 삭제합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> deleteReport(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId);

    @Operation(summary = "회의록 공유 API", description = "회의록을 공유합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> shareReport(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @Valid @RequestBody ReportShareRequest request);

    @Operation(summary = "회의록 권한 목록 조회 API", description = "회의록 권한 목록을 조회합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<List<ReportPermissionResponse>>> getAllPermissions(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId);

    @Operation(summary = "회의록 권한 수정 API", description = "회의록 권한을 수정합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> updatePermissions(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long shareId,
            @Valid @RequestBody UpdatePermissionRequest request);

    @Operation(summary = "회의록 권한 삭제 API", description = "회의록 권한을 삭제합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> deletePermissions(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long shareId);

    @Operation(summary = "발언 스크립트 전체 조회 API", description = "전체 스크립트를 페이징 처리하여 조회합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<PageResponse<ScriptResponse>>> getAllScripts(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @Parameter(description = "페이지 번호 (1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size);

    @Operation(summary = "발언 스크립트 수정 API", description = "스크립트 내용을 수정합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> updateScript(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId,
            @Valid @RequestBody UpdateScriptRequest request);

    @Operation(summary = "댓글 조회 API", description = "댓글을 조회합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<List<CommentResponse>>> getAllComments(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId);

    @Operation(summary = "댓글 생성 API", description = "댓글을 생성합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> createComments(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId,
            @Valid @RequestBody CommentRequest request);

    @Operation(summary = "댓글 수정 API", description = "댓글을 수정합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> updateComments(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request);

    @Operation(summary = "댓글 삭제 API", description = "댓글을 삭제합니다.")
    @SecurityRequirement(name = "bearerAuth")
    ResponseEntity<ApiResponse<Void>> deleteComments(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long commentId);
}
