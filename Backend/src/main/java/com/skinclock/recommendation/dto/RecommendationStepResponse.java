package com.skinclock.recommendation.dto;

import com.skinclock.product.Product;
import com.skinclock.recommendation.RecommendationStep;
import com.skinclock.recommendation.TimeSlot;

public record RecommendationStepResponse(
        int stepOrder,
        TimeSlot timeSlot,
        String description,
        String warningBadge,
        Long relatedProductId,
        String relatedProductName
) {

    public static RecommendationStepResponse from(RecommendationStep step) {
        Product product = step.getProduct();
        return new RecommendationStepResponse(
                step.getStepOrder(),
                step.getTimeSlot(),
                step.getDescription(),
                step.getWarningBadge(),
                product == null ? null : product.getId(),
                product == null ? null : product.getName()
        );
    }
}
