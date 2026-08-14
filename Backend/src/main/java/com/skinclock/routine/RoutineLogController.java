package com.skinclock.routine;

import com.skinclock.common.ApiResponse;
import com.skinclock.routine.dto.RoutineLogResponse;
import com.skinclock.routine.dto.RoutineLogSummaryResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/routine-logs")
public class RoutineLogController {

    private final RoutineLogService routineLogService;

    public RoutineLogController(RoutineLogService routineLogService) {
        this.routineLogService = routineLogService;
    }

    @GetMapping
    public ApiResponse<List<RoutineLogResponse>> getLogs(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.ok(routineLogService.getLogs(userId, from, to));
    }

    @GetMapping("/summary")
    public ApiResponse<RoutineLogSummaryResponse> getSummary(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth yearMonth
    ) {
        return ApiResponse.ok(routineLogService.getSummary(userId, yearMonth));
    }
}
