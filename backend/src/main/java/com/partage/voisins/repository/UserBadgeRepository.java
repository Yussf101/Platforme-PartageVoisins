package com.partage.voisins.repository;

import com.partage.voisins.entity.User;
import com.partage.voisins.entity.UserBadge;
import com.partage.voisins.entity.enums.BadgeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserAndBadgeType(User user, BadgeType badgeType);
    List<UserBadge> findByUserId(UUID userId);
}
