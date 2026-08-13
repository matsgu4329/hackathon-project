package com.skinclock.profile;

import com.skinclock.common.ApiResponse;
import com.skinclock.profile.dto.UserProfileRequest;
import com.skinclock.profile.dto.UserProfileResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserProfileService userProfileService;

    public ProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ApiResponse<UserProfileResponse> getProfile(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(userProfileService.getProfile(userId));
    }

    @PostMapping
    public ApiResponse<UserProfileResponse> createProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UserProfileRequest request
    ) {
        return ApiResponse.ok(userProfileService.saveProfile(userId, request));
    }

    @PutMapping
    public ApiResponse<UserProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UserProfileRequest request
    ) {
        return ApiResponse.ok(userProfileService.saveProfile(userId, request));
    }
}
