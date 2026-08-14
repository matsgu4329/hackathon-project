package com.skinclock.recommendation;

import com.skinclock.product.Product;
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

@Entity
@Table(name = "recommendation_steps")
public class RecommendationStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_recommendation_id", nullable = false)
    private DailyRecommendation dailyRecommendation;

    /** Optional link to a specific owned product (e.g. a cycle-due product). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private int stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeSlot timeSlot;

    @Column(nullable = false)
    private String description;

    /** e.g. "NIGHT_ONLY" for retinol/AHA-BHA products. Null when not applicable. */
    private String warningBadge;

    protected RecommendationStep() {
    }

    public RecommendationStep(int stepOrder, TimeSlot timeSlot, String description, String warningBadge, Product product) {
        this.stepOrder = stepOrder;
        this.timeSlot = timeSlot;
        this.description = description;
        this.warningBadge = warningBadge;
        this.product = product;
    }

    void assignTo(DailyRecommendation dailyRecommendation) {
        this.dailyRecommendation = dailyRecommendation;
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public int getStepOrder() {
        return stepOrder;
    }

    public TimeSlot getTimeSlot() {
        return timeSlot;
    }

    public String getDescription() {
        return description;
    }

    public String getWarningBadge() {
        return warningBadge;
    }
}
