package com.skinclock.notification;

import com.skinclock.common.ApiResponse;
import com.skinclock.notification.dto.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** 귀가 모의 입력 → 귀가 브리핑 알림 즉시 생성 */
    @PostMapping("/api/situations/homecoming")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationResponse> homecoming(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(notificationService.createHomecomingBriefing(userId));
    }

    /** (데모용) 아침 브리핑 수동 트리거 */
    @PostMapping("/api/notifications/morning-briefing/trigger")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationResponse> triggerMorningBriefing(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(notificationService.createMorningBriefing(userId));
    }
}
