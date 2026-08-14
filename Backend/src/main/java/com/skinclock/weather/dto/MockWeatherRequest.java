package com.skinclock.weather.dto;

import com.skinclock.weather.WeatherState;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MockWeatherRequest(
        @NotNull WeatherState weatherState,
        @NotNull @Min(0) @Max(15) Integer uvIndex,
        @Min(0) @Max(100) Integer humidity,
        Double temperature
) {
}
