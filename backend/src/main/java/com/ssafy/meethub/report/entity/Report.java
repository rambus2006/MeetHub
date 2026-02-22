package com.ssafy.meethub.report.entity;


import com.ssafy.meethub.common.domain.BaseEntity;
import com.ssafy.meethub.common.util.SummaryConverter;
import com.ssafy.meethub.meeting.model.RoomInfo;
import com.ssafy.meethub.report.dto.request.CreateReportRequest;
import com.ssafy.meethub.report.vo.Summary;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "record_file")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Convert(converter = SummaryConverter.class)
    @Column(columnDefinition = "JSON")
    private Summary summary;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private String videoPath;

    @Column(nullable = false)
    private Long folderId;

    public static Report of(CreateReportRequest request, RoomInfo roomInfo, Long folderId) {
        return Report.builder()
                .name(createName(roomInfo.getDisplayName()))
                .summary(request.summary())
                .duration(request.duration())
                .videoPath(request.videoPath())
                .folderId(folderId)
                .build();
    }

    private static String createName(String displayName) {
        return "[" + LocalDate.now() + "]" + displayName;
    }

    public void updateSummary(Summary summary) {
        this.summary = summary;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateFolderId(Long folderId) {
        this.folderId = folderId;
    }
}
