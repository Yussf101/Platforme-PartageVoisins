package com.partage.voisins.controller;

import com.partage.voisins.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    /**
     * Reçoit les messages envoyés par un client sur "/app/chat.send"
     * Et les diffuse à tous les abonnés de "/topic/conversation/{conversationId}"
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/conversation/{conversationId}")
    public ChatMessageDTO sendMessage(@Payload ChatMessageDTO chatMessage) {
        // Ici, il faudrait sauvegarder le message en BDD via le MessageRepository
        // On retourne l'objet qui sera automatiquement diffusé par le Broker Spring
        return chatMessage;
    }
}
