package com.skinclock.product;

import com.skinclock.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UsageStep usageStep;

    @ElementCollection
    @CollectionTable(name = "product_ingredient_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "ingredient_tag")
    private Set<IngredientTag> ingredientTags = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CycleType cycleType;

    private Integer cycleIntervalDays;

    @ElementCollection
    @CollectionTable(name = "product_cycle_weekdays", joinColumns = @JoinColumn(name = "product_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "weekday")
    private Set<DayOfWeek> cycleWeekdays = EnumSet.noneOf(DayOfWeek.class);

    @Column(nullable = false)
    private boolean nightOnly;

    private LocalDate lastUsedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected Product() {
    }

    public Product(User user) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    public void apply(
            String name,
            UsageStep usageStep,
            Set<IngredientTag> ingredientTags,
            CycleType cycleType,
            Integer cycleIntervalDays,
            Set<DayOfWeek> cycleWeekdays,
            LocalDate lastUsedAt
    ) {
        this.name = name;
        this.usageStep = usageStep;
        this.ingredientTags = ingredientTags == null ? new LinkedHashSet<>() : new LinkedHashSet<>(ingredientTags);
        this.cycleType = cycleType;
        this.cycleIntervalDays = cycleIntervalDays;
        this.cycleWeekdays = cycleWeekdays == null ? EnumSet.noneOf(DayOfWeek.class) : EnumSet.copyOf(cycleWeekdays);
        this.lastUsedAt = lastUsedAt;
        this.nightOnly = this.ingredientTags.stream().anyMatch(IngredientTag::forcesNightOnly);
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDate nextUseDate(LocalDate today) {
        return NextUseDateCalculator.calculate(cycleType, cycleIntervalDays, cycleWeekdays, lastUsedAt, today);
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public UsageStep getUsageStep() {
        return usageStep;
    }

    public Set<IngredientTag> getIngredientTags() {
        return ingredientTags;
    }

    public CycleType getCycleType() {
        return cycleType;
    }

    public Integer getCycleIntervalDays() {
        return cycleIntervalDays;
    }

    public Set<DayOfWeek> getCycleWeekdays() {
        return cycleWeekdays;
    }

    public boolean isNightOnly() {
        return nightOnly;
    }

    public LocalDate getLastUsedAt() {
        return lastUsedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
