package com.ssafy.meethub.report.entity;

import com.ssafy.meethub.common.domain.BaseEntity;
import com.ssafy.meethub.report.dto.request.CommentRequest;
import com.ssafy.meethub.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment")
@Getter
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TINYINT")
    private Boolean isSolved = false;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Long scriptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public static Comment create(String content, Long scriptId, User user) {
        return Comment.builder()
                .content(content)
                .scriptId(scriptId)
                .user(user)
                .isSolved(false)
                .build();
    }

    public void updateContent(CommentRequest request) {
        this.content = request.content();
    }
}
