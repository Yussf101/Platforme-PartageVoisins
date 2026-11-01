package com.partage.voisins.repository;

import com.partage.voisins.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {
    List<Rating> findByEvaluatedIdOrderByCreatedAtDesc(UUID evaluatedId);
    boolean existsByReservationIdAndEvaluatorId(UUID reservationId, UUID evaluatorId);
}
