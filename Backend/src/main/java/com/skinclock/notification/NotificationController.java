package com.skinclock.notification;

import com.skinclock.common.ApiResponse;
import com.skinclock.notification.dto.NotificationResponse;
import com.skinclock.notification.dto.NotificationStatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Phase 7 endpoints only (list + status update). Phase 6 adds
 * POST /api/situations/homecoming and POST /api/notifications/morning-briefing/trigger
 * to a controller of the same name/path — expect a small merge conflict here
 * when that branch lands; resolve by keeping all endpoint methods from both.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) NotificationType type
    ) {
        return ApiResponse.ok(notificationService.list(userId, status, type));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<NotificationResponse> updateStatus(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody NotificationStatusUpdateRequest request
    ) {
        return ApiResponse.ok(notificationService.updateStatus(userId, id, request));
    }
}
