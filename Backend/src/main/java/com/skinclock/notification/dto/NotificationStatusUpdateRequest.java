package com.skinclock.notification.dto;

import com.skinclock.notification.NotificationStatus;
import jakarta.validation.constraints.NotNull;

public record NotificationStatusUpdateRequest(@NotNull NotificationStatus status) {

    /** SPEC 6: 사용자는 완료/나중에 확인/닫힘만 선택할 수 있다 (PENDING은 시스템 초기값). */
    public void validateProcessable() {
        if (status == NotificationStatus.PENDING) {
            throw new IllegalArgumentException("status: PENDING으로는 변경할 수 없습니다 (COMPLETED, LATER, DISMISSED만 허용).");
        }
    }
}
