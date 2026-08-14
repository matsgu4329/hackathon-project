package com.skinclock.routine;

import com.skinclock.notification.Notification;
import com.skinclock.notification.NotificationStatus;
import com.skinclock.notification.NotificationType;
import com.skinclock.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "routine_logs", uniqueConstraints = @UniqueConstraint(columnNames = "notification_id"))
public class RoutineLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false, unique = true)
    private Notification notification;

    @Column(nullable = false)
    private LocalDate date;

    /** Denormalized copy of Notification.type for cheap history queries. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    private LocalDateTime completedAt;

    protected RoutineLog() {
    }

    public RoutineLog(User user, Notification notification, LocalDate date, NotificationType notificationType) {
        this.user = user;
        this.notification = notification;
        this.date = date;
        this.notificationType = notificationType;
    }

    public void applyStatus(NotificationStatus status) {
        this.status = status;
        this.completedAt = status == NotificationStatus.COMPLETED ? LocalDateTime.now() : null;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Notification getNotification() {
        return notification;
    }

    public LocalDate getDate() {
        return date;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
