package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.RatingRequestDTO;
import com.partage.voisins.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> leaveRating(
            @PathVariable UUID id,
            @RequestBody RatingRequestDTO request,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID evaluatorId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            ratingService.leaveRating(id, evaluatorId, request);
            
            return ResponseEntity.ok(Map.of("message", "Avis enregistré avec succès !"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
