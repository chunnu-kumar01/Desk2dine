package com.desk2dine.service;

import com.desk2dine.entity.AuditLog;
import com.desk2dine.dto.PageResult;
import com.desk2dine.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Thin wrapper around AuditLogRepository. Every other service calls
 * AuditLogService#record after a security-sensitive or business-
 * important action (signup, login, password change, order placed,
 * status transitions) so there is always a trail an admin can review.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(Long userId, String action, String entityType, Long entityId, String details) {
        auditLogRepository.insert(userId, action, entityType, entityId, details);
    }

    public PageResult<AuditLog> search(String actionFilter, int page, int size) {
        List<AuditLog> logs = auditLogRepository.search(actionFilter, page, size);
        long total = auditLogRepository.countSearch(actionFilter);
        return new PageResult<>(logs, page, size, total);
    }
}
