package com.partage.voisins.service;

import com.partage.voisins.dto.RatingRequestDTO;
import com.partage.voisins.entity.Rating;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.RatingRole;
import com.partage.voisins.entity.enums.ReservationStatus;
import com.partage.voisins.repository.RatingRepository;
import com.partage.voisins.repository.ReservationRepository;
import com.partage.voisins.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final UserService userService; // Pour get user
    private final BadgeService badgeService;

    @Transactional
    public void leaveRating(UUID reservationId, UUID evaluatorId, RatingRequestDTO request) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation introuvable"));

        // L'échange doit être terminé (GIVEN ou RETURNED)
        if (reservation.getStatus() != ReservationStatus.GIVEN && reservation.getStatus() != ReservationStatus.RETURNED) {
            throw new RuntimeException("Vous ne pouvez évaluer qu'un échange terminé.");
        }

        if (ratingRepository.existsByReservationIdAndEvaluatorId(reservationId, evaluatorId)) {
            throw new RuntimeException("Vous avez déjà laissé un avis pour cet échange.");
        }

        User evaluator = userService.getUserById(evaluatorId);
        User evaluated;
        RatingRole role;

        if (reservation.getBorrower().getId().equals(evaluatorId)) {
            // L'évaluateur est l'emprunteur, donc l'évalué est le propriétaire (LENDER)
            evaluated = reservation.getItem().getOwner();
            role = RatingRole.BORROWER; // Wait, if evaluator is borrower, they are acting as BORROWER
        } else if (reservation.getItem().getOwner().getId().equals(evaluatorId)) {
            // L'évaluateur est le propriétaire, donc l'évalué est l'emprunteur
            evaluated = reservation.getBorrower();
            role = RatingRole.LENDER; // The role of the person leaving the rating
        } else {
            throw new RuntimeException("Non autorisé à laisser un avis sur cette réservation.");
        }

        if (request.getScore() < 1 || request.getScore() > 5) {
            throw new IllegalArgumentException("Le score doit être entre 1 et 5.");
        }

        Rating rating = Rating.builder()
                .reservation(reservation)
                .evaluator(evaluator)
                .evaluated(evaluated)
                .score(request.getScore())
                .comment(request.getComment())
                .ratingRole(role)
                .build();

        ratingRepository.save(rating);

        updateTrustScore(evaluated);
    }

    private void updateTrustScore(User user) {
        List<Rating> ratings = ratingRepository.findByEvaluatedIdOrderByCreatedAtDesc(user.getId());
        if (ratings.isEmpty()) return;

        double sum = ratings.stream().mapToInt(Rating::getScore).sum();
        double average = sum / ratings.size();
        
        user.setTrustScore(BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP));
        userRepository.save(user);

        // Assigner badge si score >= 4.5
        badgeService.assignBadgeIfEligible(user);
    }
}
