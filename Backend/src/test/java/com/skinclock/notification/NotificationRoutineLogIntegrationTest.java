package com.skinclock.notification;

import com.skinclock.user.User;
import com.skinclock.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 6 (notification creation) isn't merged yet, so this seeds Notification
 * rows directly via the repository instead of going through a briefing-trigger
 * endpoint. Covers SPEC 6 acceptance criteria for list/status/routine-log.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationRoutineLogIntegrationTest {

    private static final String CLIENT_USER_ID = "phase7-test-user";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void listUpdateStatusAndRoutineLogFlow() throws Exception {
        User user = userService.getOrCreate(CLIENT_USER_ID);

        Notification morning = notificationRepository.save(new Notification(
                user, NotificationType.MORNING_BRIEFING,
                "아침 브리핑", "오늘의 세안법과 자외선 정보입니다.", null, null
        ));
        Notification homecoming = notificationRepository.save(new Notification(
                user, NotificationType.HOMECOMING_BRIEFING,
                "귀가 브리핑", "귀가 후 세안을 권장합니다.", null, null
        ));

        mockMvc.perform(get("/api/notifications").header("X-User-Id", CLIENT_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        mockMvc.perform(patch("/api/notifications/{id}/status", morning.getId())
                        .header("X-User-Id", CLIENT_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.processedAt").exists());

        mockMvc.perform(patch("/api/notifications/{id}/status", homecoming.getId())
                        .header("X-User-Id", CLIENT_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DISMISSED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DISMISSED"));

        // status back to PENDING is rejected
        mockMvc.perform(patch("/api/notifications/{id}/status", morning.getId())
                        .header("X-User-Id", CLIENT_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PENDING\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));

        // filter by status
        mockMvc.perform(get("/api/notifications?status=COMPLETED").header("X-User-Id", CLIENT_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].type").value("MORNING_BRIEFING"));

        String today = LocalDate.now().toString();
        mockMvc.perform(get("/api/routine-logs?from={from}&to={to}", today, today)
                        .header("X-User-Id", CLIENT_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        String yearMonth = YearMonth.now().toString();
        mockMvc.perform(get("/api/routine-logs/summary?yearMonth={ym}", yearMonth)
                        .header("X-User-Id", CLIENT_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.monthlyCompletionRate").value(0.5))
                .andExpect(jsonPath("$.data.dailyStatus[0].status").value("PARTIAL"));

        // another user can't see or modify these notifications
        mockMvc.perform(get("/api/notifications").header("X-User-Id", "someone-else"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        mockMvc.perform(patch("/api/notifications/{id}/status", morning.getId())
                        .header("X-User-Id", "someone-else")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOTIFICATION_NOT_FOUND"));
    }
}
