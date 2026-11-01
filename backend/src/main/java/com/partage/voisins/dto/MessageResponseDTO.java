package com.partage.voisins.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageResponseDTO {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
    private boolean isRead;
}
