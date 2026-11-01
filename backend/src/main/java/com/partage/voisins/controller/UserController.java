package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.UserProfileDTO;
import com.partage.voisins.entity.User;
import com.partage.voisins.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{id}/profile")
    public ResponseEntity<com.partage.voisins.dto.UserPublicProfileDTO> getUserProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide");
            }
            UUID userId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            UserProfileDTO profile = userService.getUserProfileDTO(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
