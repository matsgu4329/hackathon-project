package com.skinclock.recommendation.dto;

import com.skinclock.recommendation.DailyRecommendation;
import com.skinclock.recommendation.WeatherCondition;

import java.time.LocalDate;
import java.util.List;

public record DailyRecommendationResponse(
        LocalDate date,
        String cleansingMethod,
        WeatherCondition weatherConditionUsed,
        int uvIndexUsed,
        String disclaimer,
        List<RecommendationStepResponse> steps
) {

    public static DailyRecommendationResponse from(DailyRecommendation recommendation) {
        return new DailyRecommendationResponse(
                recommendation.getDate(),
                recommendation.getCleansingMethod(),
                recommendation.getWeatherConditionUsed(),
                recommendation.getUvIndexUsed(),
                recommendation.getDisclaimer(),
                recommendation.getSteps().stream().map(RecommendationStepResponse::from).toList()
        );
    }
}
