package com.skinclock.routine.dto;

import com.skinclock.notification.NotificationStatus;
import com.skinclock.notification.NotificationType;
import com.skinclock.routine.RoutineLog;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RoutineLogResponse(
        Long id,
        LocalDate date,
        NotificationType notificationType,
        NotificationStatus status,
        LocalDateTime completedAt
) {

    public static RoutineLogResponse from(RoutineLog log) {
        return new RoutineLogResponse(
                log.getId(),
                log.getDate(),
                log.getNotificationType(),
                log.getStatus(),
                log.getCompletedAt()
        );
    }
}
