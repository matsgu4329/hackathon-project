package com.skinclock.recommendation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyRecommendationRepository extends JpaRepository<DailyRecommendation, Long> {

    Optional<DailyRecommendation> findByUser_ClientUserIdAndDate(String clientUserId, LocalDate date);
}
