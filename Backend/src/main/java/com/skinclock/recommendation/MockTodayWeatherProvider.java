package com.skinclock.recommendation;

import org.springframework.stereotype.Component;

/**
 * Placeholder until Phase 4 (WeatherSnapshot + external API) lands.
 * Fixed to a high-UV clear day so the "high UV" recommendation branch is
 * exercised by default during development/demo.
 */
@Component
public class MockTodayWeatherProvider implements TodayWeatherProvider {

    @Override
    public TodayWeather getTodayWeather() {
        return new TodayWeather(WeatherCondition.CLEAR, 7);
    }
}
