package com.partage.voisins.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ChatMessageDTO {
    private UUID conversationId;
    private UUID senderId;
    private String content;
}
