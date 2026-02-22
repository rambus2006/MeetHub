package com.ssafy.meethub.user.repository;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.user.entity.FolderShare;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderShareRepository extends JpaRepository<FolderShare, Long> {
    boolean existsByIdAndUserIdAndPermission(Long id, Long userId, Permission permission);

    boolean existsByIdAndUserId(Long id, Long userId);

    boolean existsByFolderIdAndUserIdAndPermission(Long folderId, Long userId, Permission permission);

    boolean existsByFolderIdAndUserId(Long folderId, Long userId);

    Optional<FolderShare> findByFolderIdAndUserId(Long folderId, Long userId);

    List<FolderShare> findByUserId(Long userId);

    @Query(value = """
            WITH RECURSIVE folder_tree AS (
                SELECT id, parent_id
                FROM folder
                WHERE id = :folderId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_tree fh
                JOIN folder f ON f.parent_id = fh.id
                WHERE f.is_deleted = false
            )
            SELECT s.id
            FROM
            (SELECT id
            FROM folder_tree
            WHERE id <> :folderId) i
            JOIN
            folder_share s
            ON i.id = s.folder_id
            WHERE s.user_id = :userId;
            """, nativeQuery = true)
    List<Long> findByFolderSubtreeAndUserId(
            @Param("folderId") Long folderId,
            @Param("userId") Long userId
    );

    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT id, parent_id
                FROM folder
                WHERE id = :folderId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_hierarchy fh
                JOIN folder f ON f.id = fh.parent_id
                WHERE f.is_deleted = false
            )
            SELECT count(*)
            FROM folder_share fs
            INNER JOIN folder_hierarchy fh ON fs.folder_id = fh.id
            WHERE fs.user_id = :userId
            """, nativeQuery = true)
    Long countCanAccess(
            @Param("folderId") Long folderId,
            @Param("userId") Long userId
    );

    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT id, parent_id
                FROM folder
                WHERE id = :folderId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_hierarchy fh
                JOIN folder f ON f.id = fh.parent_id
                WHERE f.is_deleted = false
            )
            SELECT count(*)
            FROM folder_share fs
            INNER JOIN folder_hierarchy fh ON fs.folder_id = fh.id
            WHERE fs.user_id = :userId AND fs.permission = 'EDITOR'
            """, nativeQuery = true)
    Long countCanEdit(
            @Param("folderId") Long folderId,
            @Param("userId") Long userId
    );

    Long countDistinctFolderIdByFolderIdInAndUserId(List<Long> folderIds, Long userId);

    @Query(value = """
            WITH RECURSIVE folder_with_ancestors AS (
                SELECT id, parent_id, id as original_id
                FROM folder
                WHERE id IN :folderIds AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id, fwa.original_id
                FROM folder_with_ancestors fwa
                JOIN folder f ON f.id = fwa.parent_id
                WHERE f.is_deleted = false
            )
            SELECT COUNT(DISTINCT f.id)
            FROM folder f
            LEFT JOIN folder_with_ancestors fwa ON fwa.original_id = f.id
            LEFT JOIN folder_share fs ON fs.folder_id = fwa.id AND fs.user_id = :userId AND fs.permission = 'EDITOR'
            WHERE f.id IN :folderIds
              AND f.is_deleted = false
              AND (f.user_id = :userId OR fs.id IS NOT NULL)
            """, nativeQuery = true)
    Long countFoldersWithEditPermission(
            @Param("folderIds") List<Long> folderIds,
            @Param("userId") Long userId
    );

    @Modifying(clearAutomatically = true)
    @Query("""
            DELETE FROM FolderShare
            WHERE id IN :folderShares AND (:permission = 'EDITOR' OR permission = 'VIEWER')
            """)
    Integer bulkDeleteByIdInAndPermission(Collection<Long> folderShares, String permission);

    @Modifying(clearAutomatically = true)
    @Query("""
            DELETE FROM FolderShare
            WHERE folderId IN :folderIds
            """)
    Integer bulkDeleteByFolderIds(@Param("folderIds") List<Long> folderIds);
}
