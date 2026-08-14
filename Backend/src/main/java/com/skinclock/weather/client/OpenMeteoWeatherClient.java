package com.skinclock.weather.client;

import com.skinclock.weather.WeatherState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
public class OpenMeteoWeatherClient implements WeatherClient {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoWeatherClient.class);

    private final RestClient restClient;

    public OpenMeteoWeatherClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(4));
        factory.setReadTimeout(Duration.ofSeconds(4));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public Optional<WeatherResult> fetchWeather(double latitude, double longitude) {
        try {
            log.info("Fetching real-time weather & UV index from Open-Meteo for lat={}, lon={}...", latitude, longitude);

            String url = String.format(
                    "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&timezone=Asia%%2FSeoul",
                    latitude,
                    longitude
            );

            Map<?, ?> response = restClient.get()
                    .uri(URI.create(url))
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("current")) {
                log.warn("Invalid response structure from Open-Meteo API");
                return Optional.empty();
            }

            Map<?, ?> current = (Map<?, ?>) response.get("current");
            Double temp = ((Number) current.get("temperature_2m")).doubleValue();
            Integer humidity = ((Number) current.get("relative_humidity_2m")).intValue();
            int weatherCode = ((Number) current.get("weather_code")).intValue();
            double rawUv = current.get("uv_index") != null ? ((Number) current.get("uv_index")).doubleValue() : 0.0;
            int uvIndex = (int) Math.round(rawUv);

            // Map WMO weather code to WeatherState
            WeatherState state;
            if (weatherCode >= 51 && weatherCode <= 99) {
                state = WeatherState.RAIN;
            } else if (humidity <= 30) {
                state = WeatherState.DRY;
            } else if (weatherCode == 2 || weatherCode == 3 || weatherCode == 45 || weatherCode == 48) {
                state = WeatherState.CLOUDY;
            } else {
                state = WeatherState.CLEAR;
            }

            log.info("Successfully fetched live weather from Open-Meteo for ({}, {}): state={}, UV={}, temp={}°C, humidity={}%",
                    latitude, longitude, state, uvIndex, temp, humidity);

            return Optional.of(new WeatherResult(
                    state,
                    uvIndex,
                    humidity,
                    temp,
                    latitude,
                    longitude,
                    false,
                    "OPEN_METEO_API"
            ));

        } catch (Exception e) {
            log.warn("Failed to fetch weather from Open-Meteo: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
