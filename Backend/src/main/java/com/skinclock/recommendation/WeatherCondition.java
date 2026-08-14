package com.skinclock.recommendation;

/**
 * Mirrors the frontend simulator's mock weather values (Docs/frontend.md 4.1)
 * and the weatherState values planned for Phase 4's WeatherSnapshot
 * (Docs/BACKEND_DESIGN.md §2.4). Kept local to this package so Phase 5 doesn't
 * depend on Phase 4 landing first — see TodayWeatherProvider.
 */
public enum WeatherCondition {
    CLEAR,
    CLOUDY,
    RAIN,
    DRY
}
