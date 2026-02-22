package com.ssafy.meethub.common.security;

import com.ssafy.meethub.report.repository.ReportRepository;
import com.ssafy.meethub.user.repository.FolderRepository;
import com.ssafy.meethub.user.repository.FolderShareRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("filesystemSecurity")
@RequiredArgsConstructor
public class FilesystemSecurity {
    private final FolderRepository folderRepository;
    private final FolderShareRepository folderShareRepository;
    private final ReportRepository reportRepository;

    public boolean canAccess(Long folderId, Long userId) {
        return isOwner(folderId, userId)
                || folderShareRepository.countCanAccess(folderId, userId) > 0;
    }

    public boolean canEdit(Long folderId, Long userId) {
        return isOwner(folderId, userId)
                || folderShareRepository.countCanEdit(folderId, userId) > 0;
    }

    public boolean canDelete(Long folderId, Long userId) {
        return isOwner(folderId, userId);
    }

    public boolean canRelocate(List<Long> folderIds, List<Long> fileIds, Long userId) {
        // 폴더 권한 체크 - 각 폴더에 대해 소유자이거나 상위 폴더의 EDITOR 권한 포함하여 확인
        if (folderIds != null && !folderIds.isEmpty()) {
            Long countWithPermission = folderShareRepository.countFoldersWithEditPermission(folderIds, userId);
            if (countWithPermission < folderIds.size()) {
                return false;
            }
        }

        // 파일 권한 체크 - 각 파일에 대해 소유자, ReportShare EDITOR 권한, 또는 폴더의 EDITOR 권한 확인
        if (fileIds != null && !fileIds.isEmpty()) {
            Long countWithPermission = reportRepository.countFilesWithEditPermission(fileIds, userId);
            if (countWithPermission < fileIds.size()) {
                return false;
            }
        }

        return true;
    }

    private boolean isOwner(Long folderId, Long userId) {
        return folderRepository.existsByIdAndUserIdAndIsDeletedFalse(folderId, userId);
    }
}
