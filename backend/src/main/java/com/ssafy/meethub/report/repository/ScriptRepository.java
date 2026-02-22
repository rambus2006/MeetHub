package com.ssafy.meethub.report.repository;

import com.ssafy.meethub.report.entity.Script;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScriptRepository extends JpaRepository<Script, Long> {

    Page<Script> findAllByReportIdAndIsDeletedFalse(Long reportId, Pageable pageable);

    Optional<Script> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndIsDeletedFalse(Long scriptId);
}
