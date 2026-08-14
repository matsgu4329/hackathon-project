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
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date", "dedupe_key"})
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Only set for PRODUCT_CYCLE notifications. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /** Only set for MORNING_BRIEFING / HOMECOMING_BRIEFING notifications. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_recommendation_id")
    private DailyRecommendation dailyRecommendation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    /** Date part of createdAt, used for duplicate-prevention queries. */
    @Column(nullable = false)
    private LocalDate date;

    /**
     * Disambiguates same-day duplicates per type: briefings are one-per-day
     * ("MORNING_BRIEFING"), PRODUCT_CYCLE is one-per-product-per-day
     * ("PRODUCT_CYCLE:42"). Needed because a plain (user, type, date) unique
     * constraint would either wrongly block multiple products' cycle
     * notifications on the same day, or (if product_id is included directly)
     * silently fail to dedupe briefings — most SQL engines treat every NULL
     * as distinct in a unique index, so two NULL product_ids never collide.
     */
    @Column(name = "dedupe_key", nullable = false)
    private String dedupeKey;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    protected Notification() {
    }

    public Notification(User user, NotificationType type, String title, String content,
                        DailyRecommendation dailyRecommendation, Product product) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.content = content;
        this.dailyRecommendation = dailyRecommendation;
        this.product = product;
        this.status = NotificationStatus.PENDING;
        this.date = LocalDate.now();
        this.dedupeKey = product != null ? type.name() + ":" + product.getId() : type.name();
        this.createdAt = LocalDateTime.now();
    }

    public void updateStatus(NotificationStatus newStatus) {
        this.status = newStatus;
        this.processedAt = LocalDateTime.now();
    }

    // --- Getters ---

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

    public LocalDate getDate() {
        return date;
    }

    public String getDedupeKey() {
        return dedupeKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
}
