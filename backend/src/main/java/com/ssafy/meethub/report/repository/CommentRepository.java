package com.ssafy.meethub.report.repository;

import com.ssafy.meethub.report.entity.Comment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT DISTINCT c.scriptId FROM Comment c " +
            "WHERE c.scriptId IN :scriptIds AND c.isDeleted = false")
    List<Long> findScriptIdsWithComments(@Param("scriptIds") List<Long> scriptIds);

    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.scriptId = :scriptId AND c.isDeleted = false")
    List<Comment> findAllWithUserByScriptIdAndIsDeletedFalse(@Param("scriptId") Long scriptId);

    Optional<Comment> findByIdAndIsDeletedFalse(Long id);
}
