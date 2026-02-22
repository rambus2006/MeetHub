package com.ssafy.meethub.user.service;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.report.entity.Report;
import com.ssafy.meethub.report.exception.ReportErrorCode;
import com.ssafy.meethub.report.repository.ReportRepository;
import com.ssafy.meethub.report.repository.ReportShareRepository;
import com.ssafy.meethub.user.dto.response.FileResponse;
import com.ssafy.meethub.user.dto.response.FolderResponse;
import com.ssafy.meethub.user.entity.Folder;
import com.ssafy.meethub.user.entity.FolderShare;
import com.ssafy.meethub.user.entity.User;
import com.ssafy.meethub.user.exception.UserErrorCode;
import com.ssafy.meethub.user.repository.FolderRepository;
import com.ssafy.meethub.user.repository.FolderShareRepository;
import com.ssafy.meethub.user.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilesystemService {
    private final FolderRepository folderRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final FolderShareRepository folderShareRepository;
    private final ReportShareRepository reportShareRepository;

    @Value("${app.max-folder-depth}")
    private Integer maxFolderDepth;

    @Transactional
    @PreAuthorize("@filesystemSecurity.canEdit(#parentId, #userId)")
    public void createFolder(Long userId, Long parentId, String name) {
        validateFolderRules(userId, parentId);

        folderRepository.save(Folder.builder()
                .name(name)
                .parentId(parentId)
                .userId(userId)
                .build());
    }

    @Transactional
    @PreAuthorize("@filesystemSecurity.canEdit(#folderId, #userId)")
    public void updateFolderName(Long userId, Long folderId, String name) {
        Folder folder = folderRepository.findByIdAndIsDeletedFalse(folderId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.FOLDER_NOT_FOUND));

        folder.updateName(name);
    }

    @Transactional
    @PreAuthorize("@reportSecurity.canEdit(#reportId, #userId)")
    public void updateFileName(Long userId, Long reportId, String name) {
        Report report = reportRepository.findByIdAndIsDeletedFalse(reportId)
                .orElseThrow(() -> new BusinessException(ReportErrorCode.REPORT_NOT_FOUND));

        report.updateName(name);
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> readFolders(Long userId) {
        return folderRepository.findAllByUserIdInTreeOrder(userId).stream()
                .map(projection -> new FolderResponse(
                        projection.getId(),
                        projection.getParentId(),
                        projection.getName(),
                        projection.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    @PreAuthorize("@filesystemSecurity.canEdit(#folderId, #userId)")
    public void shareFolder(Long userId, Long folderId, String email, Permission permission) {
        User sharedUser = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));

        if (folderRepository.countDuplicatePermissionAncestor(folderId, sharedUser.getId(), permission.name()) > 0) {
            throw new BusinessException(UserErrorCode.DUPLICATE_PERMISSION);
        }

        removeUnnecessaryFolderShare(sharedUser.getId(), folderId, permission);

        folderShareRepository.save(FolderShare.builder()
                .userId(sharedUser.getId())
                .folderId(folderId)
                .permission(permission)
                .build());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@filesystemSecurity.canAccess(#folderId, #userId)")
    public List<FileResponse> readFiles(Long userId, Long folderId) {
        return reportRepository.findAllByFolderIdAndUserIdAndIsDeletedFalse(folderId, userId).stream()
                .map(report -> FileResponse.builder()
                        .id(report.getId())
                        .name(report.getName())
                        .createdAt(report.getCreatedAt())
                        .build()
                )
                .toList();
    }

    @Transactional
    @PreAuthorize("@filesystemSecurity.canEdit(#targetId, #userId) "
            + "and @filesystemSecurity.canRelocate(#folderRelocationInfos, #fileRelocationInfos, #userId)")
    public void relocateItems(Long userId, Long targetId,
                              List<Long> folderRelocationInfos, List<Long> fileRelocationInfos) {
        validateBeforeRelocationFolders(userId, targetId, folderRelocationInfos);
//        authorizeBeforeRelocationReports(userId, fileRelocationInfos);

        // userId가 진짜 이 리스트에 있는 걸 옮길 수 있는지 권한 체크 필요

        folderRepository.updateParentIds(folderRelocationInfos, targetId);
        reportRepository.updateParentIds(fileRelocationInfos, targetId);
    }

    @Transactional
    @PreAuthorize("@filesystemSecurity.canDelete(#folderId, #userId)")
    public void deleteFolder(Long userId, Long folderId) {
        List<Long> folderIds = folderRepository.findIdSubtreeById(folderId);
        if (folderIds.isEmpty()) {
            throw new BusinessException(UserErrorCode.FOLDER_NOT_FOUND);
        }

        List<Long> reportIds = reportRepository.findIdsByFolderIds(folderIds);
        if (!reportIds.isEmpty()) {
            reportShareRepository.bulkDeleteByReportIds(reportIds);
        }
        reportRepository.bulkSoftDeleteByFolderIds(folderIds);

        folderShareRepository.bulkDeleteByFolderIds(folderIds);
        Collections.reverse(folderIds);
        folderRepository.bulkSoftDeleteByIds(folderIds);
    }

    public void validateBeforeRelocationFolders(Long userId, Long targetId, List<Long> folderInfos) {
        if (folderRepository.countAncestorOfAll(folderInfos, targetId) > 0) {
            throw new BusinessException(UserErrorCode.CANNOT_BE_ANCESTOR_OF_TARGET);
        }
    }

    public void authorizeBeforeRelocationReports(Long userId, List<Long> fileInfos) {
        Long countNotOwnerReports = reportRepository.countNotOwnerReports(fileInfos, userId);
        Long countHasPermissionReports = reportShareRepository.countDistinctReportIdByReportIdInAndUserId(fileInfos,
                userId);
        if (!countNotOwnerReports.equals(countHasPermissionReports)) {
            throw new AuthorizationDeniedException("접근 권한이 없습니다.");
        }
    }

    public void removeUnnecessaryFolderShare(Long userId, Long folderId, Permission permission) {
        List<Long> folderShares = folderShareRepository.findByFolderSubtreeAndUserId(folderId, userId);
        folderShareRepository.findByFolderIdAndUserId(folderId, userId).ifPresent(folderShareRepository::delete);
        folderShareRepository.bulkDeleteByIdInAndPermission(folderShares, permission.name());
    }

    public void validateFolderRules(Long userId, Long parentId) {
        if (parentId == null && folderRepository.existsByParentIdAndUserId(null, userId)) {
            throw new BusinessException(UserErrorCode.ALREADY_EXISTS_ROOT_FOLDER);
        }
        if (parentId != null && !folderRepository.existsById(parentId)) {
            throw new BusinessException(UserErrorCode.NOT_FOUND_PARENT_FOLDER);
        }
        if (parentId != null && folderRepository.findDepthById(parentId).compareTo(maxFolderDepth) >= 0) {
            throw new BusinessException(UserErrorCode.EXCEED_MAX_DEPTH_LIMIT);
        }
    }

    @Transactional
    public Folder getRootFolder(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));
        return folderRepository.findByUserIdAndParentIdIsNull(user.getId())
                .orElseGet(() -> createRootFolder(userId));
    }

    private Folder createRootFolder(Long userId) {
        Folder rootFolder = Folder.generateRootFolder(userId);
        return folderRepository.save(rootFolder);
    }
}
