package com.skinclock.product;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

/**
 * Computed on demand (not persisted) so it never goes stale between "today"s.
 * Rules mirror Docs/BACKEND_DESIGN.md §2.3.
 */
final class NextUseDateCalculator {

    private NextUseDateCalculator() {
    }

    static LocalDate calculate(
            CycleType cycleType,
            Integer cycleIntervalDays,
            Set<DayOfWeek> cycleWeekdays,
            LocalDate lastUsedAt,
            LocalDate today
    ) {
        return switch (cycleType) {
            case DAILY -> today;
            case EVERY_N_DAYS -> {
                if (lastUsedAt == null || cycleIntervalDays == null) {
                    yield today;
                }
                LocalDate candidate = lastUsedAt.plusDays(cycleIntervalDays);
                yield candidate.isBefore(today) ? today : candidate;
            }
            case SPECIFIC_WEEKDAYS -> {
                if (cycleWeekdays == null || cycleWeekdays.isEmpty()) {
                    yield today;
                }
                yield java.util.stream.IntStream.rangeClosed(0, 6)
                        .mapToObj(today::plusDays)
                        .filter(date -> cycleWeekdays.contains(date.getDayOfWeek()))
                        .findFirst()
                        .orElse(today);
            }
        };
    }
}
