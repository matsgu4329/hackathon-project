package com.skinclock.routine;

import com.skinclock.notification.NotificationStatus;
import com.skinclock.routine.dto.DayStatus;
import com.skinclock.routine.dto.RoutineLogResponse;
import com.skinclock.routine.dto.RoutineLogSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RoutineLogService {

    /** How far back (from today) to look when computing the current streak, independent of the requested month. */
    private static final int STREAK_LOOKBACK_DAYS = 90;

    private final RoutineLogRepository routineLogRepository;

    public RoutineLogService(RoutineLogRepository routineLogRepository) {
        this.routineLogRepository = routineLogRepository;
    }

    @Transactional(readOnly = true)
    public List<RoutineLogResponse> getLogs(String clientUserId, LocalDate from, LocalDate to) {
        return routineLogRepository.findAllByUser_ClientUserIdAndDateBetweenOrderByDateAsc(clientUserId, from, to).stream()
                .map(RoutineLogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoutineLogSummaryResponse getSummary(String clientUserId, YearMonth yearMonth) {
        List<RoutineLog> monthLogs = routineLogRepository.findAllByUser_ClientUserIdAndDateBetweenOrderByDateAsc(
                clientUserId, yearMonth.atDay(1), yearMonth.atEndOfMonth()
        );

        Map<LocalDate, List<RoutineLog>> byDate = monthLogs.stream().collect(Collectors.groupingBy(RoutineLog::getDate));
        List<RoutineLogSummaryResponse.DailyStatusEntry> dailyStatus = byDate.entrySet().stream()
                .map(entry -> new RoutineLogSummaryResponse.DailyStatusEntry(entry.getKey(), dayStatusOf(entry.getValue())))
                .sorted(Comparator.comparing(RoutineLogSummaryResponse.DailyStatusEntry::date))
                .toList();

        long completedCount = monthLogs.stream().filter(log -> log.getStatus() == NotificationStatus.COMPLETED).count();
        double monthlyCompletionRate = monthLogs.isEmpty() ? 0.0 : (double) completedCount / monthLogs.size();

        return new RoutineLogSummaryResponse(calculateStreak(clientUserId), monthlyCompletionRate, dailyStatus);
    }

    private int calculateStreak(String clientUserId) {
        LocalDate today = LocalDate.now();
        List<RoutineLog> recentLogs = routineLogRepository.findAllByUser_ClientUserIdAndDateBetweenOrderByDateAsc(
                clientUserId, today.minusDays(STREAK_LOOKBACK_DAYS), today
        );
        Map<LocalDate, List<RoutineLog>> byDate = recentLogs.stream().collect(Collectors.groupingBy(RoutineLog::getDate));

        int streak = 0;
        for (LocalDate cursor = today; ; cursor = cursor.minusDays(1)) {
            List<RoutineLog> dayLogs = byDate.get(cursor);
            if (dayLogs == null || dayStatusOf(dayLogs) != DayStatus.COMPLETE) {
                break;
            }
            streak++;
        }
        return streak;
    }

    private DayStatus dayStatusOf(List<RoutineLog> dayLogs) {
        if (dayLogs.isEmpty()) {
            return DayStatus.NONE;
        }
        boolean allCompleted = dayLogs.stream().allMatch(log -> log.getStatus() == NotificationStatus.COMPLETED);
        if (allCompleted) {
            return DayStatus.COMPLETE;
        }
        boolean anyCompleted = dayLogs.stream().anyMatch(log -> log.getStatus() == NotificationStatus.COMPLETED);
        return anyCompleted ? DayStatus.PARTIAL : DayStatus.NONE;
    }
}
