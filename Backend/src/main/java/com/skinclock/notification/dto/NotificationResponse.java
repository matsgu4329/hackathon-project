package com.skinclock.notification.dto;

import com.skinclock.notification.Notification;
import com.skinclock.notification.NotificationStatus;
import com.skinclock.notification.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String content,
        NotificationStatus status,
        LocalDateTime createdAt,
        LocalDateTime processedAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getContent(),
                notification.getStatus(),
                notification.getCreatedAt(),
                notification.getProcessedAt()
        );
    }
}
