package com.partage.voisins.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserProfileDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private BigDecimal ecoScore;
    private BigDecimal trustScore;
    
    // Statistiques supplémentaires
    private long totalItemsShared; // Objets ajoutés au total
    private long itemsGiven;       // Objets donnés (statut GIVEN)
    private long itemsLent;        // Objets actuellement prêtés (statut LENT)
    
    // Liste des badges (les noms des badges)
    private List<String> badges;

    // Derniers avis reçus
    private List<RatingResponseDTO> recentReviews;
}
