package com.skinclock.recommendation;

import com.skinclock.weather.WeatherService;
import com.skinclock.weather.WeatherSnapshot;
import com.skinclock.weather.WeatherState;
import org.springframework.stereotype.Component;

/**
 * Phase 4 integration: backs {@link TodayWeatherProvider} with the real
 * WeatherSnapshot pipeline (external API + scheduler + fallback) instead of
 * the fixed mock used while Phase 4 was still in progress.
 */
@Component
public class RealTodayWeatherProvider implements TodayWeatherProvider {

    private final WeatherService weatherService;

    public RealTodayWeatherProvider(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Override
    public TodayWeather getTodayWeather() {
        WeatherSnapshot snapshot = weatherService.getCurrentWeather(null, null);
        return new TodayWeather(mapCondition(snapshot.getWeatherState()), snapshot.getUvIndex());
    }

    private WeatherCondition mapCondition(WeatherState state) {
        return switch (state) {
            case CLEAR -> WeatherCondition.CLEAR;
            case CLOUDY -> WeatherCondition.CLOUDY;
            case RAIN -> WeatherCondition.RAIN;
            case DRY -> WeatherCondition.DRY;
        };
    }
}
