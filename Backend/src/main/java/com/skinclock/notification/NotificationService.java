package com.skinclock.notification;

import com.skinclock.common.NotFoundException;
import com.skinclock.notification.dto.NotificationResponse;
import com.skinclock.product.Product;
import com.skinclock.product.ProductRepository;
import com.skinclock.recommendation.DailyRecommendation;
import com.skinclock.recommendation.DailyRecommendationRepository;
import com.skinclock.recommendation.RecommendationService;
import com.skinclock.recommendation.RecommendationStep;
import com.skinclock.recommendation.TimeSlot;
import com.skinclock.user.User;
import com.skinclock.user.UserService;
import com.skinclock.weather.WeatherService;
import com.skinclock.weather.WeatherSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private static final String DISCLAIMER =
            "SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다.";

    private final NotificationRepository notificationRepository;
    private final RecommendationService recommendationService;
    private final DailyRecommendationRepository dailyRecommendationRepository;
    private final WeatherService weatherService;
    private final ProductRepository productRepository;
    private final UserService userService;

    public NotificationService(
            NotificationRepository notificationRepository,
            RecommendationService recommendationService,
            DailyRecommendationRepository dailyRecommendationRepository,
            WeatherService weatherService,
            ProductRepository productRepository,
            UserService userService
    ) {
        this.notificationRepository = notificationRepository;
        this.recommendationService = recommendationService;
        this.dailyRecommendationRepository = dailyRecommendationRepository;
        this.weatherService = weatherService;
        this.productRepository = productRepository;
        this.userService = userService;
    }

    // ─────────────────────────────────────────────
    // 1. 아침 브리핑
    // ─────────────────────────────────────────────

    @Transactional
    public NotificationResponse createMorningBriefing(String clientUserId) {
        User user = userService.getOrCreate(clientUserId);
        LocalDate today = LocalDate.now();

        // 중복 방지: 당일 MORNING_BRIEFING이 이미 있으면 그대로 반환
        var existing = notificationRepository.findByUserAndTypeAndDate(
                user, NotificationType.MORNING_BRIEFING, today);
        if (existing.isPresent()) {
            log.info("Morning briefing already exists for user {} on {}, returning cached.", clientUserId, today);
            return NotificationResponse.from(existing.get());
        }

        // 추천 생성 (없으면 즉시 생성)
        recommendationService.getToday(clientUserId);
        DailyRecommendation recommendation = dailyRecommendationRepository
                .findByUser_ClientUserIdAndDate(clientUserId, today)
                .orElseThrow(() -> new NotFoundException(
                        "RECOMMENDATION_NOT_FOUND",
                        "오늘의 추천을 생성할 수 없습니다. 온보딩을 먼저 완료해주세요."
                ));

        // 날씨 정보
        WeatherSnapshot weather = weatherService.getCurrentWeather(null, null);

        // 알림 내용 작성
        String title = "☀️ 오늘의 아침 스킨케어 브리핑";
        String content = buildMorningContent(recommendation, weather);

        Notification notification = new Notification(
                user, NotificationType.MORNING_BRIEFING, title, content, recommendation, null);
        notification = notificationRepository.save(notification);

        log.info("Created MORNING_BRIEFING notification id={} for user {}", notification.getId(), clientUserId);
        return NotificationResponse.from(notification);
    }

    private String buildMorningContent(DailyRecommendation recommendation, WeatherSnapshot weather) {
        var sb = new StringBuilder();

        // 날씨 요약
        sb.append("🌤 현재 날씨: ").append(weatherStateLabel(weather)).append("\n");
        sb.append("🌡 기온: ").append(weather.getTemperature() != null ? weather.getTemperature() + "°C" : "-").append("\n");
        sb.append("☀️ 자외선 지수: ").append(weather.getUvIndex()).append(" (").append(uvGrade(weather.getUvIndex())).append(")\n");
        sb.append("💧 습도: ").append(weather.getHumidity() != null ? weather.getHumidity() + "%" : "-").append("\n\n");

        // 세안법
        sb.append("🧴 권장 세안법: ").append(recommendation.getCleansingMethod()).append("\n\n");

        // 아침 루틴 요약
        sb.append("📋 오늘 아침 루틴:\n");
        List<RecommendationStep> morningSteps = recommendation.getSteps().stream()
                .filter(s -> s.getTimeSlot() == TimeSlot.MORNING)
                .toList();
        for (RecommendationStep step : morningSteps) {
            sb.append("  ").append(step.getStepOrder()).append(". ").append(step.getDescription());
            if (step.getWarningBadge() != null) {
                sb.append(" ⚠️[").append(step.getWarningBadge()).append("]");
            }
            sb.append("\n");
        }

        sb.append("\n").append(DISCLAIMER);
        return sb.toString();
    }

    // ─────────────────────────────────────────────
    // 2. 귀가 브리핑
    // ─────────────────────────────────────────────

    @Transactional
    public NotificationResponse createHomecomingBriefing(String clientUserId) {
        User user = userService.getOrCreate(clientUserId);
        LocalDate today = LocalDate.now();

        // 중복 방지
        var existing = notificationRepository.findByUserAndTypeAndDate(
                user, NotificationType.HOMECOMING_BRIEFING, today);
        if (existing.isPresent()) {
            log.info("Homecoming briefing already exists for user {} on {}, returning cached.", clientUserId, today);
            return NotificationResponse.from(existing.get());
        }

        // 추천 생성 (없으면 즉시 생성)
        recommendationService.getToday(clientUserId);
        DailyRecommendation recommendation = dailyRecommendationRepository
                .findByUser_ClientUserIdAndDate(clientUserId, today)
                .orElseThrow(() -> new NotFoundException(
                        "RECOMMENDATION_NOT_FOUND",
                        "오늘의 추천을 생성할 수 없습니다. 온보딩을 먼저 완료해주세요."
                ));

        String title = "🏠 귀가 후 저녁 스킨케어 브리핑";
        String content = buildHomecomingContent(recommendation);

        Notification notification = new Notification(
                user, NotificationType.HOMECOMING_BRIEFING, title, content, recommendation, null);
        notification = notificationRepository.save(notification);

        log.info("Created HOMECOMING_BRIEFING notification id={} for user {}", notification.getId(), clientUserId);
        return NotificationResponse.from(notification);
    }

    private String buildHomecomingContent(DailyRecommendation recommendation) {
        var sb = new StringBuilder();

        sb.append("🧴 권장 세안법: ").append(recommendation.getCleansingMethod()).append("\n\n");

        // 귀가 후 루틴 (HOMECOMING + NIGHT)
        sb.append("📋 귀가 후 저녁 루틴:\n");
        List<RecommendationStep> eveningSteps = recommendation.getSteps().stream()
                .filter(s -> s.getTimeSlot() == TimeSlot.HOMECOMING || s.getTimeSlot() == TimeSlot.NIGHT)
                .toList();
        int order = 1;
        for (RecommendationStep step : eveningSteps) {
            sb.append("  ").append(order++).append(". ").append(step.getDescription());
            if (step.getWarningBadge() != null) {
                sb.append(" ⚠️[").append(step.getWarningBadge()).append("]");
            }
            sb.append("\n");
        }

        if (eveningSteps.isEmpty()) {
            sb.append("  (오늘 저녁 특별 루틴이 없습니다. 기본 세안 후 보습해주세요.)\n");
        }

        sb.append("\n").append(DISCLAIMER);
        return sb.toString();
    }

    // ─────────────────────────────────────────────
    // 3. 제품 사용 주기 알림
    // ─────────────────────────────────────────────

    @Transactional
    public List<NotificationResponse> createProductCycleNotifications(String clientUserId) {
        User user = userService.getOrCreate(clientUserId);
        LocalDate today = LocalDate.now();

        List<Product> products = productRepository.findAllByUser_ClientUserId(clientUserId);
        List<NotificationResponse> created = new ArrayList<>();

        for (Product product : products) {
            if (!today.equals(product.nextUseDate(today))) {
                continue; // 오늘 사용일이 아님
            }
            // 이미 당일 생성된 제품은 건너뜀
            if (notificationRepository.existsByUserAndTypeAndProductIdAndDate(
                    user, NotificationType.PRODUCT_CYCLE, product.getId(), today)) {
                continue;
            }

            String title = "🧴 " + product.getName() + " 사용 알림";
            String timeHint = product.isNightOnly() ? "취침 전" : "아침";
            String content = product.getName() + " 사용 주기가 도래했습니다. " + timeHint + "에 사용해주세요.";
            if (product.isNightOnly()) {
                content += " ⚠️ 이 제품은 야간 전용(레티놀/AHA·BHA)이므로 낮에 사용하지 마세요.";
            }

            Notification notification = new Notification(
                    user, NotificationType.PRODUCT_CYCLE, title, content, null, product);
            notification = notificationRepository.save(notification);

            log.info("Created PRODUCT_CYCLE notification id={} for product '{}' (user {})",
                    notification.getId(), product.getName(), clientUserId);
            created.add(NotificationResponse.from(notification));
        }

        return created;
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private String weatherStateLabel(WeatherSnapshot weather) {
        return switch (weather.getWeatherState()) {
            case CLEAR -> "맑음 ☀️";
            case CLOUDY -> "흐림 ☁️";
            case RAIN -> "비 🌧️";
            case DRY -> "건조 🏜️";
        };
    }

    private String uvGrade(int uvIndex) {
        if (uvIndex <= 2) return "낮음";
        if (uvIndex <= 5) return "보통";
        if (uvIndex <= 7) return "높음";
        if (uvIndex <= 10) return "매우높음";
        return "위험";
    }
}
