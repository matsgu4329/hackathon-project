package com.skinclock.recommendation;

import com.skinclock.common.ApiResponse;
import com.skinclock.recommendation.dto.DailyRecommendationResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/today")
    public ApiResponse<DailyRecommendationResponse> getToday(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(recommendationService.getToday(userId));
    }

    @PostMapping("/today/refresh")
    public ApiResponse<DailyRecommendationResponse> refreshToday(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(recommendationService.refreshToday(userId));
    }
}
