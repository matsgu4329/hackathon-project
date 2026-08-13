package com.skinclock.profile;

import com.skinclock.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkinType skinType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutingPatternType outingPatternType;

    private LocalTime outingStartTime;

    private LocalTime outingEndTime;

    private LocalTime preferredNotificationTime;

    @ElementCollection
    @CollectionTable(name = "user_profile_routine_items", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "routine_item")
    private Set<String> baseRoutineItems = new LinkedHashSet<>();

    @Column(nullable = false)
    private boolean onboardingCompleted;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected UserProfile() {
    }

    public UserProfile(User user) {
        this.user = user;
    }

    public void apply(
            SkinType skinType,
            OutingPatternType outingPatternType,
            LocalTime outingStartTime,
            LocalTime outingEndTime,
            LocalTime preferredNotificationTime,
            Set<String> baseRoutineItems
    ) {
        this.skinType = skinType;
        this.outingPatternType = outingPatternType;
        this.outingStartTime = outingStartTime;
        this.outingEndTime = outingEndTime;
        this.preferredNotificationTime = preferredNotificationTime;
        this.baseRoutineItems = baseRoutineItems == null ? new LinkedHashSet<>() : new LinkedHashSet<>(baseRoutineItems);
        this.onboardingCompleted = true;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public SkinType getSkinType() {
        return skinType;
    }

    public OutingPatternType getOutingPatternType() {
        return outingPatternType;
    }

    public LocalTime getOutingStartTime() {
        return outingStartTime;
    }

    public LocalTime getOutingEndTime() {
        return outingEndTime;
    }

    public LocalTime getPreferredNotificationTime() {
        return preferredNotificationTime;
    }

    public Set<String> getBaseRoutineItems() {
        return baseRoutineItems;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
