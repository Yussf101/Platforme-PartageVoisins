package com.partage.voisins.repository;

import com.partage.voisins.entity.User;
import com.partage.voisins.entity.UserBadge;
import com.partage.voisins.entity.enums.BadgeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserAndBadgeType(User user, BadgeType badgeType);
}
