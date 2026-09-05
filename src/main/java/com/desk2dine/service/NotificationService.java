package com.desk2dine.service;

import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.Notification;
import com.desk2dine.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

/**
 * Creates and reads in-app notifications. create() is called by
 * OrderService inside its own order-status transactions (an externally
 * managed Connection is passed in) so "order status changed" and "user
 * was notified" always commit together.
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void create(Connection connection, Long userId, String title, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.insert(connection, notification);
    }

    public PageResult<Notification> listForUser(Long userId, int page, int size) {
        List<Notification> notifications = notificationRepository.findByUser(userId, page, size);
        long total = notificationRepository.countByUser(userId);
        return new PageResult<>(notifications, page, size, total);
    }

    public Map<String, Long> unreadCount(Long userId) {
        return Map.of("unread", notificationRepository.countUnread(userId));
    }

    public void markRead(Long notificationId, Long userId) {
        notificationRepository.markRead(notificationId, userId);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }
}
