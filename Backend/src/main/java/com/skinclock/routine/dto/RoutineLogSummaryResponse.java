package com.skinclock.routine.dto;

import java.time.LocalDate;
import java.util.List;

public record RoutineLogSummaryResponse(
        int streakDays,
        double monthlyCompletionRate,
        List<DailyStatusEntry> dailyStatus
) {

    public record DailyStatusEntry(LocalDate date, DayStatus status) {
    }
}
