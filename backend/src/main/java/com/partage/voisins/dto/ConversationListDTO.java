package com.partage.voisins.dto;

import com.partage.voisins.entity.enums.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ConversationListDTO {
    private UUID id;
    private UUID reservationId;
    private UUID itemId;
    private String itemTitle;
    private UUID otherUserId;
    private String otherUserName;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private ReservationStatus reservationStatus;
    private boolean isOwner; // true si l'utilisateur actuel est le propriétaire de l'objet
    private boolean hasRated; // true si l'utilisateur actuel a déjà noté cette réservation
}
