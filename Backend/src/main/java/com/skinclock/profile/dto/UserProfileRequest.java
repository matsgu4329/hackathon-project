package com.skinclock.profile.dto;

import com.skinclock.profile.OutingPatternType;
import com.skinclock.profile.SkinType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.Set;

public record UserProfileRequest(
        @NotNull SkinType skinType,
        @NotNull OutingPatternType outingPatternType,
        LocalTime outingStartTime,
        LocalTime outingEndTime,
        LocalTime preferredNotificationTime,
        Set<String> baseRoutineItems
) {
}
