package com.partage.voisins.service;

import com.partage.voisins.entity.User;
import com.partage.voisins.entity.UserBadge;
import com.partage.voisins.entity.enums.BadgeType;
import com.partage.voisins.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;

    @Transactional
    public void assignBadgeIfEligible(User user) {
        // Logique métier simplifiée pour attribuer des badges
        if (user.getEcoScore() != null && user.getEcoScore().doubleValue() > 10.0) {
            assignBadge(user, BadgeType.ECO_10KG);
        }
        if (user.getTrustScore() != null && user.getTrustScore().doubleValue() >= 4.5) {
            assignBadge(user, BadgeType.TRUSTED_USER);
        }
    }

    private void assignBadge(User user, BadgeType badgeType) {
        boolean alreadyHasBadge = userBadgeRepository.existsByUserAndBadgeType(user, badgeType);
        if (!alreadyHasBadge) {
            UserBadge badge = UserBadge.builder()
                    .user(user)
                    .badgeType(badgeType)
                    .build();
            userBadgeRepository.save(badge);
            // TODO: Notifier l'utilisateur
        }
    }
}
