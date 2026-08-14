package com.skinclock.notification;

import com.skinclock.common.ApiResponse;
import com.skinclock.notification.dto.NotificationResponse;
import com.skinclock.notification.dto.NotificationStatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** 귀가 모의 입력 → 귀가 브리핑 알림 즉시 생성 (Phase 6) */
    @PostMapping("/api/situations/homecoming")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationResponse> homecoming(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(notificationService.createHomecomingBriefing(userId));
    }

    /** (데모용) 아침 브리핑 수동 트리거 (Phase 6) */
    @PostMapping("/api/notifications/morning-briefing/trigger")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationResponse> triggerMorningBriefing(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(notificationService.createMorningBriefing(userId));
    }

    /** 알림 목록 조회 (Phase 7) */
    @GetMapping("/api/notifications")
    public ApiResponse<List<NotificationResponse>> list(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) NotificationType type
    ) {
        return ApiResponse.ok(notificationService.list(userId, status, type));
    }

    /** 완료/나중에/닫힘 처리 (Phase 7) */
    @PatchMapping("/api/notifications/{id}/status")
    public ApiResponse<NotificationResponse> updateStatus(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody NotificationStatusUpdateRequest request
    ) {
        return ApiResponse.ok(notificationService.updateStatus(userId, id, request));
    }
}
