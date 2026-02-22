package com.ssafy.meethub.report.service;

import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.meeting.model.RoomInfo;
import com.ssafy.meethub.meeting.service.MeetingService;
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
import com.ssafy.meethub.report.entity.Comment;
import com.ssafy.meethub.report.entity.Report;
import com.ssafy.meethub.report.entity.ReportShare;
import com.ssafy.meethub.report.entity.Script;
import com.ssafy.meethub.report.exception.ReportErrorCode;
import com.ssafy.meethub.report.repository.CommentRepository;
import com.ssafy.meethub.report.repository.ReportRepository;
import com.ssafy.meethub.report.repository.ReportShareRepository;
import com.ssafy.meethub.report.repository.ScriptRepository;
import com.ssafy.meethub.user.entity.Folder;
import com.ssafy.meethub.user.entity.User;
import com.ssafy.meethub.user.service.FilesystemService;
import com.ssafy.meethub.user.service.UserService;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final RedisTemplate<String, Object> redisObjectTemplate;

    private final ReportRepository reportRepository;
    private final ScriptRepository scriptRepository;
    private final CommentRepository commentRepository;
    private final ReportShareRepository reportShareRepository;
    private final UserService userService;
    private final FilesystemService filesystemService;
    private final MeetingService meetingService;
    private final ReportPermissionService reportPermissionService;


    @Transactional
    public void createReport(CreateReportRequest request) {
        String roomKey = MeetingService.ROOM_INFO_PREFIX + request.roomId();
        RoomInfo roomInfo = (RoomInfo) redisObjectTemplate.opsForValue().get(roomKey);
        validateRoomAgent(roomInfo, request);

        Folder rootFolder = filesystemService.getRootFolder(roomInfo.getHostId());
        Report report = Report.of(request, roomInfo, rootFolder.getId());
        reportRepository.save(report);

        meetingService.deleteRoom(roomInfo.getRoomId());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@reportSecurity.canAccess(#reportId, #userId)")
    public ReportResponse getReport(Long userId, Long reportId) {
        Report report = reportRepository.findByIdAndIsDeletedFalse(reportId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_NOT_FOUND));

        return ReportResponse.from(report);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void updateReport(Long userId, Long reportId, UpdateReportRequest request) {
        Report report = reportRepository.findByIdAndIsDeletedFalse(reportId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_NOT_FOUND));

        report.updateSummary(request.summary());
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void deleteReport(Long userId, Long reportId) {
        Report report = reportRepository.findByIdAndIsDeletedFalse(reportId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_NOT_FOUND));

        report.delete();

        reportPermissionService.evictCacheForReport(reportId);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void shareReport(Long userId, Long reportId, ReportShareRequest request) {
        validateReportOwner(reportId, userId);
        User user = userService.findByEmail(request.email());
        if (reportShareRepository.existsByReportIdAndUserId(reportId, user.getId())
                || userId.equals(user.getId())) {
            throw new BusinessException(ReportErrorCode.ALREADY_SHARED_REPORT);
        }

        ReportShare reportShare = ReportShare.create(reportId, user, request.permission());
        reportShareRepository.save(reportShare);

        reportPermissionService.evictCache(reportId, userId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public List<ReportPermissionResponse> getAllPermissions(Long userId, Long reportId) {
        validateReportOwner(reportId, userId);

        List<ReportShare> reportShares = reportShareRepository.findAllWithUserByReportId(reportId);
        return reportShares.stream()
                .map(ReportPermissionResponse::from)
                .toList();
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void updatePermission(Long userId, Long reportId, Long shareId, UpdatePermissionRequest request) {
        validateReportOwner(reportId, userId);

        ReportShare reportShare = reportShareRepository.findById(shareId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_PERMISSION_NOT_FOUND));

        reportShare.updatePermission(request.permission());

        reportPermissionService.evictCache(reportId, userId);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void deletePermission(Long userId, Long reportId, Long shareId) {
        validateReportOwner(reportId, userId);

        ReportShare reportShare = reportShareRepository.findById(shareId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_PERMISSION_NOT_FOUND));

        reportShareRepository.delete(reportShare);

        reportPermissionService.evictCache(reportId, userId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@reportSecurity.canAccess(#reportId, #userId)")
    public Page<ScriptResponse> getAllScripts(Long userId, Long reportId, Pageable pageable) {
        validateReport(reportId);
        Page<Script> scriptPage = scriptRepository.findAllByReportIdAndIsDeletedFalse(reportId, pageable);

        List<Long> scriptIds = scriptPage.getContent().stream()
                .map(Script::getId)
                .toList();

        Set<Long> scriptIdsWithComments = new HashSet<>(
                commentRepository.findScriptIdsWithComments(scriptIds)
        );

        return scriptPage.map(script ->
                ScriptResponse.from(script, scriptIdsWithComments.contains(script.getId()))
        );
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void updateScript(Long userId, Long reportId, Long scriptId, UpdateScriptRequest request) {
        validateReport(reportId);
        Script script = scriptRepository.findByIdAndIsDeletedFalse(scriptId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.SCRIPT_NOT_FOUND));

        script.updateContent(request);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@reportSecurity.canAccess(#reportId, #userId)")
    public List<CommentResponse> getAllComments(Long userId, Long reportId, Long scriptId) {
        validateReport(reportId);
        validateScript(scriptId);

        List<Comment> comments = commentRepository.findAllWithUserByScriptIdAndIsDeletedFalse(scriptId);
        return comments.stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void createComment(Long userId, Long reportId, Long scriptId, CommentRequest request) {
        validateReport(reportId);
        validateScript(scriptId);

        User user = userService.getReferenceById(userId);
        Comment comment = Comment.create(request.content(), scriptId, user);
        commentRepository.save(comment);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void updateComment(Long userId, Long reportId, Long commentId, CommentRequest request) {
        validateReport(reportId);
        Comment comment = validateComment(commentId, userId);
        comment.updateContent(request);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void deleteComment(Long userId, Long reportId, Long commentId) {
        validateReport(reportId);
        Comment comment = validateComment(commentId, userId);
        comment.delete();
    }

    private void validateRoomAgent(RoomInfo roomInfo, CreateReportRequest request) {
        if (roomInfo == null) {
            log.warn("Report creation failed - Room Not Found: roomId= {}", request.roomId());
            throw new BusinessException(ReportErrorCode.ROOM_ACCESS_DENIED);
        }

        if (!roomInfo.getAgentDispatchId().equals(request.agentDispatchId())) {
            log.warn("Report creation failed - Not Room Agent: roomId= {}, hostAgentId= {}, requestAgentId= {}",
                    roomInfo.getRoomId(), roomInfo.getAgentDispatchId(), request.agentDispatchId());
            throw new BusinessException(ReportErrorCode.ROOM_ACCESS_DENIED);
        }
    }

    private void validateReportOwner(Long reportId, Long userId) {
        validateReport(reportId);
        if (!reportRepository.isOwner(reportId, userId)) {
            throw new BusinessException(ReportErrorCode.NOT_REPORT_OWNER);
        }
    }

    private void validateReport(Long reportId) {
        if (!reportRepository.existsByIdAndIsDeletedFalse(reportId)) {
            throw new BusinessException(ReportErrorCode.REPORT_NOT_FOUND);
        }
    }

    private void validateScript(Long scriptId) {
        if (!scriptRepository.existsByIdAndIsDeletedFalse(scriptId)) {
            throw new BusinessException(ReportErrorCode.SCRIPT_NOT_FOUND);
        }
    }

    private Comment validateComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.COMMENT_NOT_FOUND));

        if (!Objects.equals(comment.getUser().getId(), userId)) {
            throw new BusinessException(ReportErrorCode.NOT_COMMENT_OWNER);
        }
        return comment;
    }
}
