package com.skinclock.notification;

import com.skinclock.common.NotFoundException;
import com.skinclock.notification.dto.NotificationResponse;
import com.skinclock.notification.dto.NotificationStatusUpdateRequest;
import com.skinclock.routine.RoutineLog;
import com.skinclock.routine.RoutineLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RoutineLogRepository routineLogRepository;

    public NotificationService(NotificationRepository notificationRepository, RoutineLogRepository routineLogRepository) {
        this.notificationRepository = notificationRepository;
        this.routineLogRepository = routineLogRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(String clientUserId, NotificationStatus status, NotificationType type) {
        return notificationRepository.findAllByUser_ClientUserIdOrderByCreatedAtDesc(clientUserId).stream()
                .filter(n -> status == null || n.getStatus() == status)
                .filter(n -> type == null || n.getType() == type)
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse updateStatus(String clientUserId, Long notificationId, NotificationStatusUpdateRequest request) {
        request.validateProcessable();

        Notification notification = notificationRepository.findByIdAndUser_ClientUserId(notificationId, clientUserId)
                .orElseThrow(() -> new NotFoundException("NOTIFICATION_NOT_FOUND", "알림을 찾을 수 없습니다."));

        notification.markProcessed(request.status());

        RoutineLog routineLog = routineLogRepository.findByNotification_Id(notificationId)
                .orElseGet(() -> new RoutineLog(
                        notification.getUser(), notification, notification.getCreatedAt().toLocalDate(), notification.getType()
                ));
        routineLog.applyStatus(request.status());
        routineLogRepository.save(routineLog);

        return NotificationResponse.from(notification);
    }
}
