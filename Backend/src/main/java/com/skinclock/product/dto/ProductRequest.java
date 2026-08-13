package com.skinclock.product.dto;

import com.skinclock.product.CycleType;
import com.skinclock.product.IngredientTag;
import com.skinclock.product.UsageStep;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

public record ProductRequest(
        @NotBlank String name,
        @NotNull UsageStep usageStep,
        Set<IngredientTag> ingredientTags,
        @NotNull CycleType cycleType,
        Integer cycleIntervalDays,
        Set<DayOfWeek> cycleWeekdays,
        LocalDate lastUsedAt
) {

    /** Cross-field checks that bean validation annotations can't express cleanly. */
    public void validateCycleFields() {
        if (cycleType == CycleType.EVERY_N_DAYS && (cycleIntervalDays == null || cycleIntervalDays < 1)) {
            throw new IllegalArgumentException("cycleIntervalDays: EVERY_N_DAYS 주기에는 1 이상의 값이 필요합니다.");
        }
        if (cycleType == CycleType.SPECIFIC_WEEKDAYS && (cycleWeekdays == null || cycleWeekdays.isEmpty())) {
            throw new IllegalArgumentException("cycleWeekdays: SPECIFIC_WEEKDAYS 주기에는 최소 1개의 요일이 필요합니다.");
        }
    }
}
