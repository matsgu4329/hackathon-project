package com.skinclock.weather.client;

import java.util.Optional;

public interface WeatherClient {

    Optional<WeatherResult> fetchWeather(double latitude, double longitude);
}
