package com.ssafy.meethub.report.entity;

import com.ssafy.meethub.common.domain.BaseEntity;
import com.ssafy.meethub.report.dto.request.UpdateScriptRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "script")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Script extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String speaker;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Integer startTime;

    @Column(nullable = false)
    private Integer endTime;

    @Column(name = "record_file_id", nullable = false)
    private Long reportId;

    public void updateContent(UpdateScriptRequest request) {
        this.content = request.content();
    }
}
