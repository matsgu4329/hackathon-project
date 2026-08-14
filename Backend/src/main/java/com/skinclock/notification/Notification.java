package com.skinclock.notification;

import com.skinclock.product.Product;
import com.skinclock.recommendation.DailyRecommendation;
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

import java.time.LocalDateTime;

/**
 * Shared with Phase 6 (briefing/product-cycle generation). This branch (Phase 7)
 * only reads/updates status; creation (createMorningBriefing etc.) is Phase 6's
 * responsibility — see Docs/BACKEND_DESIGN.md §2.6 and the Phase 6 prompt in
 * Docs/IMPLEMENTATION_PLAN.md.
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_recommendation_id")
    private DailyRecommendation dailyRecommendation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    protected Notification() {
    }

    public Notification(
            User user,
            NotificationType type,
            String title,
            String content,
            Product product,
            DailyRecommendation dailyRecommendation
    ) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.content = content;
        this.product = product;
        this.dailyRecommendation = dailyRecommendation;
        this.status = NotificationStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public void markProcessed(NotificationStatus status) {
        this.status = status;
        this.processedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Product getProduct() {
        return product;
    }

    public DailyRecommendation getDailyRecommendation() {
        return dailyRecommendation;
    }

    public NotificationType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
}
