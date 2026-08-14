package com.skinclock.weather.client;

import com.skinclock.weather.WeatherState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@Component
public class KmaWeatherClient implements WeatherClient {

    private static final Logger log = LoggerFactory.getLogger(KmaWeatherClient.class);

    private final String serviceKey;
    private final RestClient restClient;

    public KmaWeatherClient(
            @Value("${skinclock.weather.kma-service-key:}") String serviceKey
    ) {
        this.serviceKey = serviceKey != null ? serviceKey.trim() : "";

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(3));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public Optional<WeatherResult> fetchWeather(double latitude, double longitude) {
        if (serviceKey.isEmpty()) {
            log.info("KMA Service Key is not set. Skipping KMA API.");
            return Optional.empty();
        }

        try {
            // Convert GPS (lat, lon) to KMA grid (nx, ny)
            KmaGridConverter.GridPoint grid = KmaGridConverter.convert(latitude, longitude);
            log.info("Fetching real-time weather from KMA API for lat={}, lon={} -> nx={}, ny={}",
                    latitude, longitude, grid.nx(), grid.ny());

            // Calculate baseDate and baseTime (KMA Ultra-Srt Ncst updates every hour at :40)
            LocalTime nowTime = LocalTime.now();
            LocalDate nowDate = LocalDate.now();
            if (nowTime.getMinute() < 45) {
                nowTime = nowTime.minusHours(1);
                if (nowTime.getHour() == 23) {
                    nowDate = nowDate.minusDays(1);
                }
            }

            String baseDate = nowDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = String.format("%02d00", nowTime.getHour());

            String weatherUrl = String.format(
                    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=%s&numOfRows=20&pageNo=1&dataType=JSON&base_date=%s&base_time=%s&nx=%d&ny=%d",
                    URLEncoder.encode(serviceKey, StandardCharsets.UTF_8),
                    baseDate,
                    baseTime,
                    grid.nx(),
                    grid.ny()
            );

            Map<?, ?> response = restClient.get()
                    .uri(URI.create(weatherUrl))
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("response")) {
                log.warn("Invalid response structure from KMA Weather API");
                return Optional.empty();
            }

            Double temp = 20.0;
            Integer humidity = 50;
            int pty = 0;

            try {
                Map<?, ?> resBody = (Map<?, ?>) ((Map<?, ?>) response.get("response")).get("body");
                Map<?, ?> itemsObj = (Map<?, ?>) resBody.get("items");
                java.util.List<?> items = (java.util.List<?>) itemsObj.get("item");

                for (Object itemObj : items) {
                    Map<?, ?> item = (Map<?, ?>) itemObj;
                    String category = (String) item.get("category");
                    String obsrValue = (String) item.get("obsrValue");

                    if ("T1H".equals(category)) {
                        temp = Double.parseDouble(obsrValue);
                    } else if ("REH".equals(category)) {
                        humidity = (int) Math.round(Double.parseDouble(obsrValue));
                    } else if ("PTY".equals(category)) {
                        pty = Integer.parseInt(obsrValue);
                    }
                }
            } catch (Exception e) {
                log.warn("Could not parse KMA weather items: {}", e.getMessage());
            }

            // Weather state mapping
            WeatherState state;
            if (pty > 0) {
                state = WeatherState.RAIN;
            } else if (humidity != null && humidity <= 30) {
                state = WeatherState.DRY;
            } else {
                state = WeatherState.CLEAR;
            }

            int uv = estimateUvIndex(nowTime.getHour(), state);

            log.info("Successfully fetched KMA weather: state={}, temp={}°C, humidity={}%", state, temp, humidity);

            return Optional.of(new WeatherResult(
                    state,
                    uv,
                    humidity,
                    temp,
                    latitude,
                    longitude,
                    false,
                    "KMA_OPEN_API"
            ));

        } catch (Exception e) {
            log.warn("Failed to fetch weather from KMA API: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private int estimateUvIndex(int hour, WeatherState state) {
        if (hour < 7 || hour > 19) return 0;
        int peakUv = 7;
        if (state == WeatherState.RAIN || state == WeatherState.CLOUDY) peakUv = 3;
        int hourDiff = Math.abs(13 - hour);
        return Math.max(1, peakUv - hourDiff);
    }
}
