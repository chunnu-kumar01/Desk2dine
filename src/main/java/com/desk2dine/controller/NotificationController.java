package com.desk2dine.controller;

import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.Notification;
import com.desk2dine.service.NotificationService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Any logged-in user: view and manage their own in-app notifications. */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<PageResult<Notification>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest httpRequest) {
        return ApiResponse.ok(notificationService.listForUser(SessionUtil.getCurrentUserId(httpRequest), page, size));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(HttpServletRequest httpRequest) {
        return ApiResponse.ok(notificationService.unreadCount(SessionUtil.getCurrentUserId(httpRequest)));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id, HttpServletRequest httpRequest) {
        notificationService.markRead(id, SessionUtil.getCurrentUserId(httpRequest));
        return ApiResponse.ok("Marked read", null);
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllRead(HttpServletRequest httpRequest) {
        notificationService.markAllRead(SessionUtil.getCurrentUserId(httpRequest));
        return ApiResponse.ok("All marked read", null);
    }
}
