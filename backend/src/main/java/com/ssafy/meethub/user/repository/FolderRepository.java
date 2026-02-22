package com.ssafy.meethub.user.repository;

import com.ssafy.meethub.user.entity.Folder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    Optional<Folder> findByUserIdAndParentIdIsNull(Long userId);

    Optional<Folder> findByIdAndIsDeletedFalse(Long id);

    boolean existsByParentIdAndUserId(Long parentId, Long userId);

    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT id, parent_id, 0 AS depth
                FROM folder
                WHERE id = :folderId AND is_deleted = false

                UNION ALL

                SELECT f.id, f.parent_id, fh.depth + 1
                FROM folder f
                INNER JOIN folder_hierarchy fh ON f.id = fh.parent_id
                WHERE f.is_deleted = false
            )
            SELECT depth FROM folder_hierarchy WHERE parent_id IS NULL
            """, nativeQuery = true)
    Integer findDepthById(@Param("folderId") Long folderId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query(value =
            "WITH RECURSIVE folder_tree AS ( " +
                    "    /* 루트 폴더들 (parent_id IS NULL) */ " +
                    "    SELECT " +
                    "        id, " +
                    "        parent_id, " +
                    "        name, " +
                    "        created_at, " +
                    "        0 as depth, " +
                    "        CAST(LPAD(id, 20, '0') AS CHAR(4000)) as sort_path " +
                    "    FROM folder " +
                    "    WHERE user_id = :userId " +
                    "        AND is_deleted = false " +
                    "        AND parent_id IS NULL " +
                    "    " +
                    "    UNION ALL " +
                    "    " +
                    "    /* 재귀적으로 자식 폴더들 찾기 */ " +
                    "    SELECT " +
                    "        f.id, " +
                    "        f.parent_id, " +
                    "        f.name, " +
                    "        f.created_at, " +
                    "        ft.depth + 1, " +
                    "        CONCAT(ft.sort_path, '-', LPAD(f.id, 20, '0')) " +
                    "    FROM folder f " +
                    "    INNER JOIN folder_tree ft ON f.parent_id = ft.id " +
                    "    WHERE f.user_id = :userId " +
                    "        AND f.is_deleted = false " +
                    ") " +
                    "SELECT id, parent_id, name, created_at " +
                    "FROM folder_tree " +
                    "ORDER BY sort_path",
            nativeQuery = true)
    List<FolderProjection> findAllByUserIdInTreeOrder(@Param("userId") Long userId);

    boolean existsByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT id, parent_id
                FROM folder
                WHERE id = :targetId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_hierarchy fh
                JOIN folder f ON f.id = fh.parent_id
                WHERE f.is_deleted = false
            )
            SELECT count(*)
            FROM folder_hierarchy
            WHERE id = :sourceId;
            """, nativeQuery = true)
    Long countAncestor(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);

    @Query(value = """
            WITH RECURSIVE folder_hierarchy AS (
                SELECT *
                FROM folder
                WHERE id = :folderId AND is_deleted = false
                UNION ALL
                SELECT f.*
                FROM folder_hierarchy fh
                JOIN folder f ON f.parent_id = fh.id
                WHERE f.is_deleted = false
            )
            SELECT id FROM folder_hierarchy;
            """, nativeQuery = true)
    List<Long> findIdSubtreeById(@Param("folderId") Long folderId);

    boolean existsByIdAndIsDeletedFalse(Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Folder f SET f.isDeleted = true " +
            "WHERE f.id IN :folderIds AND f.isDeleted = false")
    Integer bulkSoftDeleteByIds(@Param("folderIds") List<Long> folderIds);

    Long countByIdInAndUserIdNotAndIsDeletedFalse(List<Long> ids, Long userId);

    @Query(value = """
            WITH RECURSIVE folder_tree AS (
            	SELECT id, parent_id
                FROM folder
                WHERE id = :targetId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_tree t
                JOIN folder f
                ON t.parent_id = f.id
                WHERE f.is_deleted = false
            )
            SELECT count(*)
            FROM folder_tree
            WHERE id IN :folderInfos;
            """, nativeQuery = true)
    Long countAncestorOfAll(@Param("folderInfos") List<Long> folderInfos, @Param("targetId") Long targetId);

    @Query(value = """
            WITH RECURSIVE folder_tree AS (
            	SELECT id, parent_id
                FROM folder
                WHERE id = :folderId AND is_deleted = false
                UNION ALL
                SELECT f.id, f.parent_id
                FROM folder_tree t
                JOIN folder f
                ON t.parent_id = f.id
                WHERE f.is_deleted = false
            )
            SELECT count(*)
            FROM folder_tree t
            JOIN folder_share s
            ON t.id = s.folder_id
            WHERE s.user_id = :userId AND (:permission = 'VIEWER' OR s.permission = 'EDITOR')
            """, nativeQuery = true)
    Long countDuplicatePermissionAncestor(@Param("folderId") Long folderId,
                                          @Param("userId") Long userId,
                                          @Param("permission") String permission);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Folder
            SET parentId = :targetId
            WHERE id IN :folderInfos
            """)
    Integer updateParentIds(@Param("folderInfos") List<Long> folderInfos, @Param("targetId") Long targetId);

    // Projection Interface
    interface FolderProjection {
        Long getId();

        Long getParentId();

        String getName();

        LocalDateTime getCreatedAt();
    }
}
