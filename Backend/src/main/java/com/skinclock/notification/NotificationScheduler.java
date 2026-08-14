package com.skinclock.notification;

import com.skinclock.profile.UserProfile;
import com.skinclock.profile.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

/**
 * Scheduled job that automatically creates morning briefing and product cycle notifications
 * for all onboarded users at their preferred notification time (default 08:00).
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private static final LocalTime DEFAULT_NOTIFICATION_TIME = LocalTime.of(8, 0);

    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(UserProfileRepository userProfileRepository,
                                  NotificationService notificationService) {
        this.userProfileRepository = userProfileRepository;
        this.notificationService = notificationService;
    }

    /** Runs every minute, checks if it's any user's preferred notification time. */
    @Scheduled(fixedRate = 60000)
    public void scheduledMorningBriefing() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        List<UserProfile> allProfiles = userProfileRepository.findAll();
        for (UserProfile profile : allProfiles) {
            if (!profile.isOnboardingCompleted()) {
                continue;
            }

            LocalTime preferred = profile.getPreferredNotificationTime() != null
                    ? profile.getPreferredNotificationTime()
                    : DEFAULT_NOTIFICATION_TIME;

            // Match hour and minute
            if (preferred.getHour() == now.getHour() && preferred.getMinute() == now.getMinute()) {
                String clientUserId = profile.getUser().getClientUserId();
                try {
                    log.info("Triggering scheduled morning briefing for user {}", clientUserId);
                    notificationService.createMorningBriefing(clientUserId);
                    notificationService.createProductCycleNotifications(clientUserId);
                } catch (Exception e) {
                    log.warn("Failed to create scheduled notifications for user {}: {}",
                            clientUserId, e.getMessage());
                }
            }
        }
    }
}
