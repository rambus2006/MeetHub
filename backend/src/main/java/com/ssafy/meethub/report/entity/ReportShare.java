package com.ssafy.meethub.report.entity;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "record_file_share")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_file_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Permission permission;

    @Builder(access = AccessLevel.PRIVATE)
    private ReportShare(Long reportId, User user, Permission permission) {
        this.reportId = reportId;
        this.user = user;
        this.permission = permission;
    }

    public static ReportShare create(Long reportId, User user, Permission permission) {
        return ReportShare.builder()
                .reportId(reportId)
                .user(user)
                .permission(permission)
                .build();
    }

    public void updatePermission(Permission permission) {
        this.permission = permission;
    }
}
