package com.partage.voisins.controller;

import com.partage.voisins.dto.ReservationRequestDTO;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequestDTO request) {
        Reservation reservation = new Reservation();
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        
        Reservation created = reservationService.createReservation(
                request.getItemId(),
                request.getBorrowerId(),
                reservation
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptReservation(@PathVariable UUID id) {
        reservationService.acceptReservation(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/handover")
    public ResponseEntity<Void> confirmHandover(@PathVariable UUID id) {
        reservationService.confirmHandover(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/return")
    public ResponseEntity<Void> confirmReturn(@PathVariable UUID id) {
        reservationService.confirmReturnByBorrower(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/recovery")
    public ResponseEntity<Void> confirmRecovery(@PathVariable UUID id) {
        reservationService.confirmRecoveryByLender(id);
        return ResponseEntity.ok().build();
    }
}
