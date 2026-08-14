package com.skinclock.recommendation;

import com.skinclock.common.NotFoundException;
import com.skinclock.product.Product;
import com.skinclock.product.ProductRepository;
import com.skinclock.profile.SkinType;
import com.skinclock.profile.UserProfile;
import com.skinclock.profile.UserProfileRepository;
import com.skinclock.recommendation.dto.DailyRecommendationResponse;
import com.skinclock.user.User;
import com.skinclock.user.UserService;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RecommendationService {

    private static final String DISCLAIMER =
            "SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다.";
    private static final int HIGH_UV_THRESHOLD = 6;

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final ProductRepository productRepository;
    private final DailyRecommendationRepository dailyRecommendationRepository;
    private final TodayWeatherProvider todayWeatherProvider;
    private final RecommendationService self;

    public RecommendationService(
            UserService userService,
            UserProfileRepository userProfileRepository,
            ProductRepository productRepository,
            DailyRecommendationRepository dailyRecommendationRepository,
            TodayWeatherProvider todayWeatherProvider,
            @Lazy RecommendationService self
    ) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
        this.productRepository = productRepository;
        this.dailyRecommendationRepository = dailyRecommendationRepository;
        this.todayWeatherProvider = todayWeatherProvider;
        this.self = self;
    }

    @Transactional
    public DailyRecommendationResponse getToday(String clientUserId) {
        return dailyRecommendationRepository.findByUser_ClientUserIdAndDate(clientUserId, LocalDate.now())
                .map(DailyRecommendationResponse::from)
                .orElseGet(() -> generateOrRetry(clientUserId));
    }

    @Transactional
    public DailyRecommendationResponse refreshToday(String clientUserId) {
        return generateOrRetry(clientUserId);
    }

    /**
     * Two concurrent requests for the same user+day (e.g. React StrictMode's
     * double-effect in dev, or two tabs) can both miss the initial read and
     * race to insert; the loser hits the (user, date) unique constraint.
     *
     * The retry must run in a brand-new transaction/EntityManager, not just
     * catch-and-continue in the one that failed — once a Hibernate session
     * has seen a flush exception it's unusable for anything further ("Entry
     * ... has a null identifier ... session is flushed after an exception
     * occurs"). So generateSafely()'s failure is left to propagate and roll
     * back cleanly, and the retry read (fetchExisting) runs in its own
     * REQUIRES_NEW transaction. Both must go through the {@code self} proxy —
     * a direct call would bypass Spring's transaction interception entirely.
     */
    private DailyRecommendationResponse generateOrRetry(String clientUserId) {
        try {
            return self.generateSafely(clientUserId);
        } catch (DataIntegrityViolationException lostRace) {
            return self.fetchExisting(clientUserId).orElseThrow(() -> lostRace);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DailyRecommendationResponse generateSafely(String clientUserId) {
        return generate(clientUserId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public Optional<DailyRecommendationResponse> fetchExisting(String clientUserId) {
        return dailyRecommendationRepository.findByUser_ClientUserIdAndDate(clientUserId, LocalDate.now())
                .map(DailyRecommendationResponse::from);
    }

    private DailyRecommendationResponse generate(String clientUserId) {
        User user = userService.getOrCreate(clientUserId);
        UserProfile profile = userProfileRepository.findByUser(user)
                .filter(UserProfile::isOnboardingCompleted)
                .orElseThrow(() -> new NotFoundException(
                        "PROFILE_NOT_ONBOARDED",
                        "온보딩을 먼저 완료해야 추천을 받을 수 있습니다."
                ));

        List<Product> products = productRepository.findAllByUser_ClientUserId(clientUserId);
        TodayWeather weather = todayWeatherProvider.getTodayWeather();
        LocalDate today = LocalDate.now();

        String cleansingMethod = buildCleansingMethod(profile.getSkinType());
        List<RecommendationStep> steps = buildSteps(products, weather, today);

        DailyRecommendation recommendation = dailyRecommendationRepository
                .findByUser_ClientUserIdAndDate(clientUserId, today)
                .orElseGet(() -> new DailyRecommendation(user, today));
        recommendation.regenerate(cleansingMethod, weather.condition(), weather.uvIndex(), DISCLAIMER, steps);

        return DailyRecommendationResponse.from(dailyRecommendationRepository.save(recommendation));
    }

    private String buildCleansingMethod(SkinType skinType) {
        return switch (skinType) {
            case DRY -> "저자극 약산성 클렌저로 짧게 세안하고 바로 보습해주세요.";
            case OILY -> "폼클렌저로 꼼꼼히 세안하되 과도한 마찰은 피해주세요.";
            case SENSITIVE -> "미온수와 저자극 클렌저로 최소한의 자극만 주도록 세안해주세요.";
            case COMBINATION, UNKNOWN -> "T존은 폼클렌저로 꼼꼼히, 볼 부위는 가볍게 세안해주세요.";
        };
    }

    private List<RecommendationStep> buildSteps(List<Product> products, TodayWeather weather, LocalDate today) {
        List<RecommendationStep> steps = new ArrayList<>();
        int order = 1;

        steps.add(new RecommendationStep(order++, TimeSlot.MORNING, "미온수로 가벼운 아침 세안하기", null, null));

        if (weather.uvIndex() >= HIGH_UV_THRESHOLD) {
            steps.add(new RecommendationStep(
                    order++, TimeSlot.MORNING,
                    "자외선 차단제(SPF50+)를 꼼꼼히 발라주세요 (오늘 자외선 지수 " + weather.uvIndex() + ")",
                    null, null
            ));
        } else {
            steps.add(new RecommendationStep(order++, TimeSlot.MORNING, "가벼운 보습 크림 바르기", null, null));
        }

        if (weather.condition() == WeatherCondition.DRY) {
            steps.add(new RecommendationStep(
                    order++, TimeSlot.MORNING, "건조한 날씨이니 수분 크림을 한 겹 더 덧발라주세요", null, null
            ));
        }

        for (Product product : products) {
            if (today.equals(product.nextUseDate(today))) {
                TimeSlot slot = product.isNightOnly() ? TimeSlot.NIGHT : TimeSlot.MORNING;
                String badge = product.isNightOnly() ? "NIGHT_ONLY" : null;
                steps.add(new RecommendationStep(
                        order++, slot, product.getName() + " 사용하기 (사용 주기 도래)", badge, product
                ));
            }
        }

        steps.add(new RecommendationStep(
                order, TimeSlot.HOMECOMING, "귀가 후 클렌징으로 하루 동안 쌓인 먼지와 자외선 차단제를 씻어내기", null, null
        ));

        return steps;
    }
}
