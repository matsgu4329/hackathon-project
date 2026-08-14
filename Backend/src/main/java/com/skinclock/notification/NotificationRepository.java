package com.skinclock.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByUser_ClientUserIdOrderByCreatedAtDesc(String clientUserId);

    Optional<Notification> findByIdAndUser_ClientUserId(Long id, String clientUserId);
}
