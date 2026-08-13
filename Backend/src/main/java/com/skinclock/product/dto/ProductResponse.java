package com.skinclock.product.dto;

import com.skinclock.product.CycleType;
import com.skinclock.product.IngredientTag;
import com.skinclock.product.Product;
import com.skinclock.product.UsageStep;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

public record ProductResponse(
        Long id,
        String name,
        UsageStep usageStep,
        Set<IngredientTag> ingredientTags,
        CycleType cycleType,
        Integer cycleIntervalDays,
        Set<DayOfWeek> cycleWeekdays,
        boolean nightOnly,
        LocalDate lastUsedAt,
        LocalDate nextUseDate
) {

    public static ProductResponse from(Product product, LocalDate today) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getUsageStep(),
                product.getIngredientTags(),
                product.getCycleType(),
                product.getCycleIntervalDays(),
                product.getCycleWeekdays(),
                product.isNightOnly(),
                product.getLastUsedAt(),
                product.nextUseDate(today)
        );
    }
}
