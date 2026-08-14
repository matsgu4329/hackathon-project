package com.skinclock.recommendation;

/**
 * Isolates where "today's weather" comes from so the recommendation engine
 * doesn't need to wait on Phase 4 (WeatherSnapshot + external API). Once
 * Phase 4 lands, replace {@link MockTodayWeatherProvider} with a bean backed
 * by the real WeatherSnapshot repository — nothing else in this package
 * should need to change.
 */
public interface TodayWeatherProvider {

    TodayWeather getTodayWeather();
}
