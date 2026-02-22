package com.ssafy.meethub.report.service;

import com.ssafy.meethub.common.domain.Permission;
import com.ssafy.meethub.report.repository.ReportRepository;
import com.ssafy.meethub.report.repository.ReportShareRepository;
import java.time.Duration;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportPermissionService {
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private final RedisTemplate<String, String> redisTemplate;
    private final ReportRepository reportRepository;
    private final ReportShareRepository reportShareRepository;

    public Permission getPermission(Long reportId, Long userId) {
        String key = cacheKey(reportId, userId);

        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return Permission.valueOf(cached);
        }

        Permission computed = computePermission(reportId, userId);
        if (computed != null) {
            redisTemplate.opsForValue().set(key, computed.name(), CACHE_TTL);
        }

        return computed;
    }

    private Permission computePermission(Long reportId, Long userId) {
        if (reportRepository.isOwner(reportId, userId)) {
            return Permission.EDITOR;
        }

        return reportShareRepository.findEffectivePermission(reportId, userId);
    }

    public void evictCache(Long reportId, Long userId) {
        redisTemplate.delete(cacheKey(reportId, userId));
    }

    public void evictCacheForReport(Long reportId) {
        Set<String> keys = redisTemplate.keys("perm:report:" + reportId + ":*");
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String cacheKey(Long reportId, Long userId) {
        return "perm:report:" + reportId + ":" + userId;
    }
}
