package com.ssafy.meethub.report.repository;

import com.ssafy.meethub.report.entity.Report;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM Report r JOIN Folder f ON r.folderId = f.id " +
            "WHERE r.id = :reportId AND f.userId = :userId AND r.isDeleted = false")
    boolean isOwner(@Param("reportId") Long reportId, @Param("userId") Long userId);

    List<Report> findByFolderIdAndIsDeletedFalse(Long folderId);

    boolean existsByIdAndIsDeletedFalse(Long id);

    @Query(value = """
            SELECT r.*
            FROM record_file r
            JOIN record_file_share s
            ON r.id = s.record_file_id
            WHERE r.folder_id = :folderId AND s.user_id = :userId AND r.is_deleted = false
            UNION ALL
            SELECT r.*
            FROM record_file r
            JOIN folder f
            ON r.folder_id = f.id
            WHERE r.folder_id = :folderId AND f.user_id = :userId AND r.is_deleted = false;
            """, nativeQuery = true)
    List<Report> findAllByFolderIdAndUserIdAndIsDeletedFalse(@Param("folderId") Long folderId,
                                                             @Param("userId") Long userId);

    @Query("""
            SELECT r.id
            FROM Report r
            WHERE r.folderId IN :folderIds AND r.isDeleted = false
            """)
    List<Long> findIdsByFolderIds(@Param("folderIds") List<Long> folderIds);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Report r SET r.isDeleted = true " +
            "WHERE r.folderId IN :folderIds AND r.isDeleted = false")
    Integer bulkSoftDeleteByFolderIds(@Param("folderIds") List<Long> folderIds);

    @Query("""
            SELECT count(*)
            FROM Report r
            JOIN Folder f
            ON r.folderId = f.id
            WHERE f.userId <> :userId AND r.id IN :folderIds AND r.isDeleted = false
            """)
    Long countNotOwnerReports(@Param("folderIds") List<Long> folderIds, @Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Report
            SET folderId = :targetId
            WHERE id IN :fileInfos
            """)
    Integer updateParentIds(@Param("fileInfos") List<Long> fileInfos, @Param("targetId") Long targetId);

    @Query(value = """
            WITH RECURSIVE file_folders AS (
                SELECT DISTINCT r.id as file_id, r.folder_id
                FROM record_file r
                WHERE r.id IN :fileIds AND r.is_deleted = false
            ),
            folder_with_ancestors AS (
                SELECT ff.file_id, f.id as folder_id, f.parent_id
                FROM file_folders ff
                JOIN folder f ON f.id = ff.folder_id
                WHERE f.is_deleted = false
                UNION ALL
                SELECT fwa.file_id, f.id, f.parent_id
                FROM folder_with_ancestors fwa
                JOIN folder f ON f.id = fwa.parent_id
                WHERE f.is_deleted = false
            )
            SELECT COUNT(DISTINCT r.id)
            FROM record_file r
            JOIN folder f ON r.folder_id = f.id
            LEFT JOIN record_file_share rfs
            ON rfs.record_file_id = r.id AND rfs.user_id = :userId AND rfs.permission = 'EDITOR'
            LEFT JOIN folder_with_ancestors fwa ON fwa.file_id = r.id
            LEFT JOIN folder_share fs
            ON fs.folder_id = fwa.folder_id AND fs.user_id = :userId AND fs.permission = 'EDITOR'
            WHERE r.id IN :fileIds
              AND r.is_deleted = false
              AND (f.user_id = :userId OR rfs.id IS NOT NULL OR fs.id IS NOT NULL)
            """, nativeQuery = true)
    Long countFilesWithEditPermission(@Param("fileIds") List<Long> fileIds, @Param("userId") Long userId);
}
