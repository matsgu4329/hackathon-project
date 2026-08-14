package com.skinclock.recommendation;

import com.skinclock.user.User;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "daily_recommendations", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"}))
public class DailyRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String cleansingMethod;

    /** Weather actually used to generate this recommendation (denormalized; see TodayWeatherProvider). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeatherCondition weatherConditionUsed;

    @Column(nullable = false)
    private int uvIndexUsed;

    @Column(nullable = false)
    private String disclaimer;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @OneToMany(mappedBy = "dailyRecommendation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepOrder ASC")
    private List<RecommendationStep> steps = new ArrayList<>();

    protected DailyRecommendation() {
    }

    public DailyRecommendation(User user, LocalDate date) {
        this.user = user;
        this.date = date;
    }

    /** Replaces the guidance text and step list, e.g. on first generation or a manual refresh. */
    public void regenerate(
            String cleansingMethod,
            WeatherCondition weatherCondition,
            int uvIndex,
            String disclaimer,
            List<RecommendationStep> newSteps
    ) {
        this.cleansingMethod = cleansingMethod;
        this.weatherConditionUsed = weatherCondition;
        this.uvIndexUsed = uvIndex;
        this.disclaimer = disclaimer;
        this.generatedAt = LocalDateTime.now();
        this.steps.clear();
        for (RecommendationStep step : newSteps) {
            step.assignTo(this);
            this.steps.add(step);
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getCleansingMethod() {
        return cleansingMethod;
    }

    public WeatherCondition getWeatherConditionUsed() {
        return weatherConditionUsed;
    }

    public int getUvIndexUsed() {
        return uvIndexUsed;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public List<RecommendationStep> getSteps() {
        return steps;
    }
}
