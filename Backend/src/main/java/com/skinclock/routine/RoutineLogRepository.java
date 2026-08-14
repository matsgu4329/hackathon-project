package com.skinclock.routine;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoutineLogRepository extends JpaRepository<RoutineLog, Long> {

    Optional<RoutineLog> findByNotification_Id(Long notificationId);

    List<RoutineLog> findAllByUser_ClientUserIdAndDateBetweenOrderByDateAsc(String clientUserId, LocalDate from, LocalDate to);
}
