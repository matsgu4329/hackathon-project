package com.skinclock.profile;

import com.skinclock.profile.dto.UserProfileRequest;
import com.skinclock.profile.dto.UserProfileResponse;
import com.skinclock.user.User;
import com.skinclock.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserService userService, UserProfileRepository userProfileRepository) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String clientUserId) {
        return userProfileRepository.findByUser_ClientUserId(clientUserId)
                .map(UserProfileResponse::from)
                .orElseGet(UserProfileResponse::notOnboarded);
    }

    @Transactional
    public UserProfileResponse saveProfile(String clientUserId, UserProfileRequest request) {
        User user = userService.getOrCreate(clientUserId);
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> new UserProfile(user));

        profile.apply(
                request.skinType(),
                request.outingPatternType(),
                request.outingStartTime(),
                request.outingEndTime(),
                request.preferredNotificationTime(),
                request.baseRoutineItems()
        );

        return UserProfileResponse.from(userProfileRepository.save(profile));
    }
}
