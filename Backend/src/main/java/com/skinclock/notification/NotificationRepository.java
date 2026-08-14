package com.skinclock.notification;

import com.skinclock.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Check if a notification of the given type already exists for this user today. */
    boolean existsByUserAndTypeAndDate(User user, NotificationType type, LocalDate date);

    /** Find the existing notification of a given type for this user today (for returning cached result). */
    Optional<Notification> findByUserAndTypeAndDate(User user, NotificationType type, LocalDate date);

    /** Check if a PRODUCT_CYCLE notification already exists for this user+product today. */
    boolean existsByUserAndTypeAndProductIdAndDate(User user, NotificationType type, Long productId, LocalDate date);

    /** Find all notifications for a user (for Phase 7 listing). */
    List<Notification> findAllByUser_ClientUserIdOrderByCreatedAtDesc(String clientUserId);
}
