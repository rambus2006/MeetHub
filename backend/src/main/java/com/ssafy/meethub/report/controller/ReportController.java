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
import com.ssafy.meethub.report.service.ReportService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController implements ReportApi {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createReport(
            @Valid @RequestBody CreateReportRequest request) {
        reportService.createReport(request);
        return ResponseEntity.ok(ApiResponse.success("회의록 생성에 성공하였습니다."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId) {
        ReportResponse response = reportService.getReport(userDetails.getUserId(), reportId);
        return ResponseEntity.ok(ApiResponse.success("회의록 상세 조회에 성공하였습니다.", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId,
            @Valid @RequestBody UpdateReportRequest request) {
        reportService.updateReport(userDetails.getUserId(), reportId, request);
        return ResponseEntity.ok(ApiResponse.success("회의록 수정에 성공하였습니다."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId) {
        reportService.deleteReport(userDetails.getUserId(), reportId);
        return ResponseEntity.ok(ApiResponse.success("회의록 삭제에 성공하였습니다."));
    }

    @PostMapping("/{id}/shares")
    public ResponseEntity<ApiResponse<Void>> shareReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId,
            @Valid @RequestBody ReportShareRequest request) {
        reportService.shareReport(userDetails.getUserId(), reportId, request);
        return ResponseEntity.ok(ApiResponse.success("회의록 공유에 성공하였습니다."));
    }

    @GetMapping("/{id}/shares")
    public ResponseEntity<ApiResponse<List<ReportPermissionResponse>>> getAllPermissions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId) {
        List<ReportPermissionResponse> response = reportService.getAllPermissions(userDetails.getUserId(), reportId);
        return ResponseEntity.ok(ApiResponse.success("회의록 권한 목록 조회에 성공하였습니다.", response));
    }

    @PutMapping("/{reportId}/shares/{shareId}")
    public ResponseEntity<ApiResponse<Void>> updatePermissions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long shareId,
            @Valid @RequestBody UpdatePermissionRequest request) {
        reportService.updatePermission(userDetails.getUserId(), reportId, shareId, request);
        return ResponseEntity.ok(ApiResponse.success("회의록 권한 수정을 완료하였습니다."));
    }

    @DeleteMapping("/{reportId}/shares/{shareId}")
    public ResponseEntity<ApiResponse<Void>> deletePermissions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long shareId) {
        reportService.deletePermission(userDetails.getUserId(), reportId, shareId);
        return ResponseEntity.ok(ApiResponse.success("회의록 권한 삭제를 완료하였습니다."));
    }

    @GetMapping("/{id}/scripts")
    public ResponseEntity<ApiResponse<PageResponse<ScriptResponse>>> getAllScripts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(value = "id") Long reportId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("startTime").ascending());
        Page<ScriptResponse> scriptPage = reportService.getAllScripts(userDetails.getUserId(), reportId, pageable);
        PageResponse<ScriptResponse> response = PageResponse.of(scriptPage);
        return ResponseEntity.ok(ApiResponse.success("스크립트 전체 조회에 성공하였습니다.", response));
    }

    @PutMapping("/{reportId}/scripts/{scriptId}")
    public ResponseEntity<ApiResponse<Void>> updateScript(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId,
            @Valid @RequestBody UpdateScriptRequest request) {
        reportService.updateScript(userDetails.getUserId(), reportId, scriptId, request);
        return ResponseEntity.ok(ApiResponse.success("스크립트 수정이 완료되었습니다."));
    }

    @GetMapping("/{reportId}/scripts/{scriptId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getAllComments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId) {
        List<CommentResponse> response = reportService.getAllComments(userDetails.getUserId(), reportId, scriptId);
        return ResponseEntity.ok(ApiResponse.success("댓글 조회에 성공하였습니다.", response));
    }

    @PostMapping("/{reportId}/scripts/{scriptId}/comments")
    public ResponseEntity<ApiResponse<Void>> createComments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long scriptId,
            @Valid @RequestBody CommentRequest request) {
        reportService.createComment(userDetails.getUserId(), reportId, scriptId, request);
        return ResponseEntity.ok(ApiResponse.success("댓글 생성에 성공하였습니다."));
    }

    @PutMapping("/{reportId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> updateComments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {
        reportService.updateComment(userDetails.getUserId(), reportId, commentId, request);
        return ResponseEntity.ok(ApiResponse.success("댓글 수정을 완료하였습니다."));
    }

    @DeleteMapping("/{reportId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long reportId,
            @PathVariable Long commentId) {
        reportService.deleteComment(userDetails.getUserId(), reportId, commentId);
        return ResponseEntity.ok(ApiResponse.success("댓글 삭제에 성공하였습니다."));
    }


}
