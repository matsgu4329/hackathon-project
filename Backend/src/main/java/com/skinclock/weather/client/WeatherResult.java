package com.skinclock.weather.client;

import com.skinclock.weather.WeatherSnapshot;
import com.skinclock.weather.WeatherState;

import java.time.LocalDateTime;

public record WeatherResult(
        WeatherState weatherState,
        Integer uvIndex,
        Integer humidity,
        Double temperature,
        Double latitude,
        Double longitude,
        boolean isFallback,
        String source
) {

    public WeatherSnapshot toSnapshot() {
        return new WeatherSnapshot(
                weatherState,
                uvIndex,
                humidity,
                temperature,
                latitude,
                longitude,
                LocalDateTime.now(),
                isFallback,
                source
        );
    }
}
