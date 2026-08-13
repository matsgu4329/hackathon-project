package com.skinclock.profile.dto;

import com.skinclock.profile.OutingPatternType;
import com.skinclock.profile.SkinType;
import com.skinclock.profile.UserProfile;

import java.time.LocalTime;
import java.util.Set;

public record UserProfileResponse(
        SkinType skinType,
        OutingPatternType outingPatternType,
        LocalTime outingStartTime,
        LocalTime outingEndTime,
        LocalTime preferredNotificationTime,
        Set<String> baseRoutineItems,
        boolean onboardingCompleted
) {

    public static UserProfileResponse notOnboarded() {
        return new UserProfileResponse(null, null, null, null, null, Set.of(), false);
    }

    public static UserProfileResponse from(UserProfile profile) {
        return new UserProfileResponse(
                profile.getSkinType(),
                profile.getOutingPatternType(),
                profile.getOutingStartTime(),
                profile.getOutingEndTime(),
                profile.getPreferredNotificationTime(),
                profile.getBaseRoutineItems(),
                profile.isOnboardingCompleted()
        );
    }
}
