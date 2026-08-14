package com.skinclock.weather;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeatherSnapshotRepository extends JpaRepository<WeatherSnapshot, Long> {

    Optional<WeatherSnapshot> findTopByOrderByFetchedAtDesc();
}
