package com.skinclock.weather;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_snapshots")
public class WeatherSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeatherState weatherState;

    @Column(nullable = false)
    private Integer uvIndex;

    private Integer humidity;

    private Double temperature;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    @Column(nullable = false)
    private boolean isFallback;

    @Column(nullable = false)
    private String source;

    protected WeatherSnapshot() {
    }

    public WeatherSnapshot(
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
        this.weatherState = weatherState;
        this.uvIndex = uvIndex;
        this.humidity = humidity;
        this.temperature = temperature;
        this.latitude = latitude;
        this.longitude = longitude;
        this.fetchedAt = fetchedAt != null ? fetchedAt : LocalDateTime.now();
        this.isFallback = isFallback;
        this.source = source != null ? source : "UNKNOWN";
    }

    public static WeatherSnapshot defaultFallback(Double latitude, Double longitude) {
        return new WeatherSnapshot(
                WeatherState.CLEAR,
                5,
                45,
                22.0,
                latitude != null ? latitude : 37.5665,
                longitude != null ? longitude : 126.9780,
                LocalDateTime.now(),
                true,
                "FALLBACK_DEFAULT"
        );
    }

    public Long getId() {
        return id;
    }

    public WeatherState getWeatherState() {
        return weatherState;
    }

    public Integer getUvIndex() {
        return uvIndex;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public Double getTemperature() {
        return temperature;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public boolean isFallback() {
        return isFallback;
    }

    public String getSource() {
        return source;
    }
}
