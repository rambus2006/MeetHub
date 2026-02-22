package com.ssafy.meethub.report.repository;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.report.entity.ReportShare;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportShareRepository extends JpaRepository<ReportShare, Long> {

    boolean existsByReportIdAndUserIdAndPermission(Long reportId, Long userId, Permission permission);

    boolean existsByReportIdAndUserId(Long reportId, Long userId);

    Long countDistinctReportIdByReportIdInAndUserId(Collection<Long> reportIds, Long userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            DELETE FROM ReportShare
            WHERE reportId IN :reportIds
            """)
    Integer bulkDeleteByReportIds(@Param("reportIds") List<Long> reportIds);

    @Query("SELECT rs FROM ReportShare rs JOIN FETCH rs.user WHERE rs.reportId = :reportId ORDER BY rs.permission")
    List<ReportShare> findAllWithUserByReportId(@Param("reportId") Long reportId);

    Optional<ReportShare> findById(Long id);

    // 기존 + 추가
    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT f.id, f.parent_id
                FROM folder f
                JOIN record_file r ON r.folder_id = f.id
                WHERE r.id = :reportId

                UNION ALL

                SELECT f.id, f.parent_id
                FROM folder f
                JOIN folder_hierarchy fh ON f.id = fh.parent_id
            )
            SELECT COALESCE(
                MAX(CASE
                    WHEN rfs.permission = 'EDITOR' THEN 'EDITOR'
                    WHEN fs.permission = 'EDITOR' THEN 'EDITOR'
                    WHEN rfs.permission = 'VIEWER' THEN 'VIEWER'
                    WHEN fs.permission = 'VIEWER' THEN 'VIEWER'
                END),
                NULL
            )
            FROM folder_hierarchy fh
            LEFT JOIN record_file_share rfs ON rfs.record_file_id = :reportId AND rfs.user_id = :userId
            LEFT JOIN folder_share fs ON fs.folder_id = fh.id AND fs.user_id = :userId
            """, nativeQuery = true)
    Permission findEffectivePermission(@Param("reportId") Long reportId, @Param("userId") Long userId);
}
