package com.skinclock.weather;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeatherScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeatherScheduler.class);

    private final WeatherService weatherService;

    public WeatherScheduler(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Initial weather data collection on application startup...");
        try {
            weatherService.refreshWeather(null, null);
        } catch (Exception e) {
            log.error("Failed initial weather collection on startup: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRate = 3600000) // Every 1 hour
    public void scheduleWeatherSync() {
        log.info("Triggering scheduled 1-hour weather data synchronization...");
        try {
            weatherService.refreshWeather(null, null);
        } catch (Exception e) {
            log.error("Failed scheduled weather synchronization: {}", e.getMessage());
        }
    }
}
