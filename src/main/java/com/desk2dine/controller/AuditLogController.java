package com.desk2dine.controller;

import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.AuditLog;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.AuditLogService;
import com.desk2dine.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

/** Admin-only: browse the audit trail. */
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<PageResult<AuditLog>> search(
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(auditLogService.search(action, page, size));
    }
}
