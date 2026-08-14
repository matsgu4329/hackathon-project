package com.skinclock.weather;

import com.skinclock.weather.client.KmaWeatherClient;
import com.skinclock.weather.client.OpenMeteoWeatherClient;
import com.skinclock.weather.client.WeatherResult;
import com.skinclock.weather.dto.MockWeatherRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    private final WeatherSnapshotRepository weatherSnapshotRepository;
    private final KmaWeatherClient kmaWeatherClient;
    private final OpenMeteoWeatherClient openMeteoWeatherClient;
    private final double defaultLatitude;
    private final double defaultLongitude;

    public WeatherService(
            WeatherSnapshotRepository weatherSnapshotRepository,
            KmaWeatherClient kmaWeatherClient,
            OpenMeteoWeatherClient openMeteoWeatherClient,
            @Value("${skinclock.weather.default-latitude:37.5665}") double defaultLatitude,
            @Value("${skinclock.weather.default-longitude:126.9780}") double defaultLongitude
    ) {
        this.weatherSnapshotRepository = weatherSnapshotRepository;
        this.kmaWeatherClient = kmaWeatherClient;
        this.openMeteoWeatherClient = openMeteoWeatherClient;
        this.defaultLatitude = defaultLatitude;
        this.defaultLongitude = defaultLongitude;
    }

    @Transactional(readOnly = true)
    public WeatherSnapshot getCurrentWeather(Double latitude, Double longitude) {
        if (latitude != null && longitude != null) {
            // Check if we have a fresh snapshot (within 30 mins) for this coordinate
            return weatherSnapshotRepository.findTopByOrderByFetchedAtDesc()
                    .filter(s -> isCoordinateClose(s.getLatitude(), s.getLongitude(), latitude, longitude)
                            && s.getFetchedAt().isAfter(LocalDateTime.now().minusMinutes(30)))
                    .orElseGet(() -> refreshWeather(latitude, longitude));
        }

        return weatherSnapshotRepository.findTopByOrderByFetchedAtDesc()
                .orElseGet(() -> refreshWeather(defaultLatitude, defaultLongitude));
    }

    public WeatherSnapshot refreshWeather(Double latitude, Double longitude) {
        double lat = latitude != null ? latitude : defaultLatitude;
        double lon = longitude != null ? longitude : defaultLongitude;

        log.info("Refreshing weather snapshot for coordinates ({}, {})...", lat, lon);

        // 1. Try KMA API (기상청)
        Optional<WeatherResult> kmaResult = kmaWeatherClient.fetchWeather(lat, lon);
        if (kmaResult.isPresent()) {
            return weatherSnapshotRepository.save(kmaResult.get().toSnapshot());
        }

        // 2. Try Open-Meteo API (Open Real-Time Weather & UV)
        Optional<WeatherResult> openMeteoResult = openMeteoWeatherClient.fetchWeather(lat, lon);
        if (openMeteoResult.isPresent()) {
            return weatherSnapshotRepository.save(openMeteoResult.get().toSnapshot());
        }

        // 3. Fallback: Reuse last existing snapshot with fallback flag or use default fallback
        log.warn("All external weather APIs failed or unavailable for ({}, {}). Falling back to default baseline.", lat, lon);
        WeatherSnapshot fallbackSnapshot = weatherSnapshotRepository.findTopByOrderByFetchedAtDesc()
                .map(last -> new WeatherSnapshot(
                        last.getWeatherState(),
                        last.getUvIndex(),
                        last.getHumidity(),
                        last.getTemperature(),
                        lat,
                        lon,
                        LocalDateTime.now(),
                        true,
                        last.getSource() + "_FALLBACK_CACHE"
                ))
                .orElseGet(() -> WeatherSnapshot.defaultFallback(lat, lon));

        return weatherSnapshotRepository.save(fallbackSnapshot);
    }

    public WeatherSnapshot setMockWeather(MockWeatherRequest request, Double latitude, Double longitude) {
        double lat = latitude != null ? latitude : defaultLatitude;
        double lon = longitude != null ? longitude : defaultLongitude;

        log.info("Applying mock weather simulation for ({}, {}): state={}, UV={}, temp={}, humidity={}",
                lat, lon, request.weatherState(), request.uvIndex(), request.temperature(), request.humidity());

        WeatherSnapshot mockSnapshot = new WeatherSnapshot(
                request.weatherState(),
                request.uvIndex(),
                request.humidity() != null ? request.humidity() : 50,
                request.temperature() != null ? request.temperature() : 23.0,
                lat,
                lon,
                LocalDateTime.now(),
                false,
                "MOCK_SIMULATOR"
        );

        return weatherSnapshotRepository.save(mockSnapshot);
    }

    private boolean isCoordinateClose(Double lat1, Double lon1, double lat2, double lon2) {
        if (lat1 == null || lon1 == null) return false;
        return Math.abs(lat1 - lat2) < 0.05 && Math.abs(lon1 - lon2) < 0.05;
    }
}
