package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.ReservationRequestDTO;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationRequestDTO request,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID borrowerId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            Reservation reservation = new Reservation();
            reservation.setStartDate(request.getStartDate());
            reservation.setEndDate(request.getEndDate());
            
            Reservation created = reservationService.createReservation(
                    request.getItemId(),
                    borrowerId,
                    reservation,
                    request.getInitialMessage()
            );
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Demande envoyée avec succès",
                "id", created.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptReservation(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            UUID ownerId = getUserIdFromToken(token);
            reservationService.acceptReservation(id, ownerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectReservation(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            UUID ownerId = getUserIdFromToken(token);
            reservationService.rejectReservation(id, ownerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    private UUID getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtUtil.validateToken(jwt)) {
                return UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            }
        }
        throw new RuntimeException("Non autorisé");
    }
    
    @PostMapping("/{id}/handover")
    public ResponseEntity<?> confirmHandover(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            UUID ownerId = getUserIdFromToken(token);
            reservationService.confirmHandover(id, ownerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/return")
    public ResponseEntity<?> confirmReturn(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            UUID borrowerId = getUserIdFromToken(token);
            reservationService.confirmReturnByBorrower(id, borrowerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/recovery")
    public ResponseEntity<?> confirmRecovery(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            UUID ownerId = getUserIdFromToken(token);
            reservationService.confirmRecoveryByLender(id, ownerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
