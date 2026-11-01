package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.ConversationListDTO;
import com.partage.voisins.dto.MessageResponseDTO;
import com.partage.voisins.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final JwtUtil jwtUtil;

    private UUID getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtUtil.validateToken(jwt)) {
                return UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            }
        }
        throw new RuntimeException("Non autorisé");
    }

    @GetMapping
    public ResponseEntity<?> getUserConversations(@RequestHeader("Authorization") String token) {
        try {
            UUID userId = getUserIdFromToken(token);
            List<ConversationListDTO> convs = conversationService.getUserConversations(userId);
            return ResponseEntity.ok(convs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String token) {
        try {
            UUID userId = getUserIdFromToken(token);
            long count = conversationService.getUnreadMessageCount(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable UUID id, @RequestHeader("Authorization") String token) {
        try {
            UUID userId = getUserIdFromToken(token);
            List<MessageResponseDTO> messages = conversationService.getConversationMessages(id, userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable UUID id, 
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String token) {
        try {
            UUID userId = getUserIdFromToken(token);
            String content = body.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le message ne peut pas être vide");
            }
            MessageResponseDTO sentMessage = conversationService.sendMessage(id, userId, content);
            return ResponseEntity.ok(sentMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
