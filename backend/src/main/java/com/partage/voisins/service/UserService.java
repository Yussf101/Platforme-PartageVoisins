package com.partage.voisins.service;

import com.partage.voisins.entity.User;
import com.partage.voisins.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void addEcoScore(UUID userId, BigDecimal co2Saved) {
        User user = getUserById(userId);
        BigDecimal currentScore = user.getEcoScore() != null ? user.getEcoScore() : BigDecimal.ZERO;
        user.setEcoScore(currentScore.add(co2Saved));
        userRepository.save(user);
        
        // Vérifier si un nouveau badge est débloqué (DA1)
        badgeService.assignBadgeIfEligible(user);
    }
}
