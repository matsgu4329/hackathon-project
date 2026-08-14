package com.skinclock.weather.dto;

import com.skinclock.weather.WeatherSnapshot;
import com.skinclock.weather.WeatherState;

import java.time.LocalDateTime;

public record WeatherSnapshotResponse(
        Long id,
        WeatherState weatherState,
        Integer uvIndex,
        Integer humidity,
        Double temperature,
        Double latitude,
        Double longitude,
        LocalDateTime fetchedAt,
        boolean isFallback,
        String source
) {

    public static WeatherSnapshotResponse from(WeatherSnapshot snapshot) {
        return new WeatherSnapshotResponse(
                snapshot.getId(),
                snapshot.getWeatherState(),
                snapshot.getUvIndex(),
                snapshot.getHumidity(),
                snapshot.getTemperature(),
                snapshot.getLatitude(),
                snapshot.getLongitude(),
                snapshot.getFetchedAt(),
                snapshot.isFallback(),
                snapshot.getSource()
        );
    }
}
