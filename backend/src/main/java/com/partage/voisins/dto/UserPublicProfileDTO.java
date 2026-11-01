package com.partage.voisins.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserPublicProfileDTO {
    private UUID id;
    private String firstName;
    private BigDecimal ecoScore;
    private BigDecimal trustScore;
    
    // Statistiques supplémentaires
    private long totalItemsShared;
    private long itemsGiven;
    private long itemsLent;
    
    // Badges et avis
    private List<String> badges;
    private List<RatingResponseDTO> recentReviews;
    
    // Objets actuellement proposés par l'utilisateur
    private List<ItemResponseDTO> sharedItems;
}
