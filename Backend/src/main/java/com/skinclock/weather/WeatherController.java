package com.skinclock.weather;

import com.skinclock.common.ApiResponse;
import com.skinclock.weather.dto.MockWeatherRequest;
import com.skinclock.weather.dto.WeatherSnapshotResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    public ApiResponse<WeatherSnapshotResponse> getCurrentWeather(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        WeatherSnapshot snapshot = weatherService.getCurrentWeather(latitude, longitude);
        return ApiResponse.ok(WeatherSnapshotResponse.from(snapshot));
    }

    @PostMapping("/refresh")
    public ApiResponse<WeatherSnapshotResponse> refreshWeather(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        WeatherSnapshot snapshot = weatherService.refreshWeather(latitude, longitude);
        return ApiResponse.ok(WeatherSnapshotResponse.from(snapshot));
    }

    @PostMapping("/mock")
    public ApiResponse<WeatherSnapshotResponse> setMockWeather(
            @Valid @RequestBody MockWeatherRequest request,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        WeatherSnapshot snapshot = weatherService.setMockWeather(request, latitude, longitude);
        return ApiResponse.ok(WeatherSnapshotResponse.from(snapshot));
    }
}
