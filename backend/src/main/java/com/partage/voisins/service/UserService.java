package com.partage.voisins.service;

import com.partage.voisins.dto.RatingResponseDTO;
import com.partage.voisins.dto.UserProfileDTO;
import com.partage.voisins.dto.UserPublicProfileDTO;
import com.partage.voisins.dto.ItemResponseDTO;
import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.Rating;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.UserBadge;
import com.partage.voisins.entity.enums.ReservationStatus;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.RatingRepository;
import com.partage.voisins.repository.ReservationRepository;
import com.partage.voisins.repository.UserBadgeRepository;
import com.partage.voisins.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final UserBadgeRepository userBadgeRepository;
    private final ItemRepository itemRepository;
    private final ReservationRepository reservationRepository;
    private final RatingRepository ratingRepository;

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

    public UserProfileDTO getUserProfileDTO(UUID userId) {
        User user = getUserById(userId);
        List<UserBadge> badges = userBadgeRepository.findByUserId(userId);
        List<Item> items = itemRepository.findByOwnerId(userId);
        List<Reservation> reservations = reservationRepository.findByItemOwnerId(userId);
        List<Rating> ratings = ratingRepository.findByEvaluatedIdOrderByCreatedAtDesc(userId);

        long totalItemsShared = items.size();
        long itemsGiven = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.GIVEN).count();
        long itemsLent = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.LENT).count();

        List<RatingResponseDTO> recentReviews = ratings.stream().limit(10).map(r -> 
            RatingResponseDTO.builder()
                .id(r.getId())
                .score(r.getScore())
                .comment(r.getComment())
                .evaluatorName(r.getEvaluator().getFirstName())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return UserProfileDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .ecoScore(user.getEcoScore())
                .trustScore(user.getTrustScore())
                .totalItemsShared(totalItemsShared)
                .itemsGiven(itemsGiven)
                .itemsLent(itemsLent)
                .badges(badges.stream().map(b -> b.getBadgeType().name()).collect(Collectors.toList()))
                .recentReviews(recentReviews)
                .build();
    }

    public UserPublicProfileDTO getPublicProfile(UUID userId) {
        User user = getUserById(userId);
        List<UserBadge> badges = userBadgeRepository.findByUserId(userId);
        List<Item> items = itemRepository.findByOwnerId(userId);
        List<Reservation> reservations = reservationRepository.findByItemOwnerId(userId);
        List<Rating> ratings = ratingRepository.findByEvaluatedIdOrderByCreatedAtDesc(userId);

        long totalItemsShared = items.size();
        long itemsGiven = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.GIVEN).count();
        long itemsLent = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.LENT).count();

        List<RatingResponseDTO> recentReviews = ratings.stream().limit(10).map(r -> 
            RatingResponseDTO.builder()
                .id(r.getId())
                .score(r.getScore())
                .comment(r.getComment())
                .evaluatorName(r.getEvaluator().getFirstName())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        List<String> badgeNames = badges.stream().map(b -> b.getBadgeType().name()).collect(Collectors.toList());

        List<ItemResponseDTO> sharedItems = items.stream().map(item -> ItemResponseDTO.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .itemCondition(item.getItemCondition())
                .sharingType(item.getSharingType())
                .rentalPrice(item.getRentalPrice())
                .deposit(item.getDeposit())
                .status(item.getStatus())
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .ownerId(item.getOwner().getId())
                .ownerFirstName(item.getOwner().getFirstName())
                .latitude(item.getLocation() != null ? item.getLocation().getLatitude() : null)
                .longitude(item.getLocation() != null ? item.getLocation().getLongitude() : null)
                .trustScore(item.getOwner().getTrustScore())
                .ownerBadges(badgeNames)
                .co2Saved(item.getCategory() != null ? item.getCategory().getCo2PerUnit() : null)
                .photoUrls(item.getPhotos() != null ? item.getPhotos().stream().map(p -> p.getUrl()).collect(Collectors.toList()) : null)
                .build()).collect(Collectors.toList());

        return UserPublicProfileDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .ecoScore(user.getEcoScore())
                .trustScore(user.getTrustScore())
                .totalItemsShared(totalItemsShared)
                .itemsGiven(itemsGiven)
                .itemsLent(itemsLent)
                .badges(badgeNames)
                .recentReviews(recentReviews)
                .sharedItems(sharedItems)
                .build();
    }
}
