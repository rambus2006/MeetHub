package com.ssafy.meethub.common.security;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.report.service.ReportPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("reportSecurity")
@RequiredArgsConstructor
public class ReportSecurity {

    private final ReportPermissionService reportPermissionService;

    public boolean canAccess(Long reportId, Long userId) {
        return reportPermissionService.getPermission(reportId, userId) != null;
    }

    public boolean canEdit(Long reportId, Long userId) {
        return reportPermissionService.getPermission(reportId, userId) == Permission.EDITOR;
    }
}
