package com.partage.voisins.service;

import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.entity.enums.ReservationStatus;
import com.partage.voisins.entity.enums.SharingType;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.ReservationRepository;
import com.partage.voisins.service.co2.Co2CalculatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ItemRepository itemRepository;
    private final UserService userService;
    private final Co2CalculatorContext co2Calculator;

    @Transactional
    public Reservation createReservation(UUID itemId, UUID borrowerId, Reservation reservationDetails) {
        Item item = itemRepository.findById(itemId).orElseThrow();
        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new RuntimeException("Item is not available");
        }

        User borrower = userService.getUserById(borrowerId);
        
        Reservation reservation = Reservation.builder()
                .item(item)
                .borrower(borrower)
                .startDate(reservationDetails.getStartDate())
                .endDate(reservationDetails.getEndDate())
                .status(ReservationStatus.PENDING)
                .build();
                
        // Création implicite de la conversation à ajouter ici via ChatService (à faire)
        
        return reservationRepository.save(reservation);
    }

    @Transactional
    public void acceptReservation(UUID reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        res.setStatus(ReservationStatus.ACCEPTED);
        
        // Marquer l'objet comme indisponible
        Item item = res.getItem();
        item.setStatus(ItemStatus.UNAVAILABLE);
        itemRepository.save(item);
        
        reservationRepository.save(res);
    }

    @Transactional
    public void confirmHandover(UUID reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        SharingType type = res.getItem().getSharingType();
        
        if (type == SharingType.DONATION) {
            // Logique de Don (terminal)
            res.setStatus(ReservationStatus.GIVEN);
            calculateAndAssignCo2(res);
        } else {
            // Logique de Prêt / Location
            res.setStatus(ReservationStatus.LENT);
        }
        reservationRepository.save(res);
    }

    @Transactional
    public void confirmReturnByBorrower(UUID reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        res.setStatus(ReservationStatus.PENDING_CONFIRMATION);
        reservationRepository.save(res);
    }

    @Transactional
    public void confirmRecoveryByLender(UUID reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        res.setStatus(ReservationStatus.RETURNED);
        
        // Remettre l'objet disponible
        Item item = res.getItem();
        item.setStatus(ItemStatus.AVAILABLE);
        itemRepository.save(item);
        
        calculateAndAssignCo2(res);
        reservationRepository.save(res);
    }

    private void calculateAndAssignCo2(Reservation res) {
        int days = 1;
        if (res.getStartDate() != null && res.getEndDate() != null) {
            days = (int) ChronoUnit.DAYS.between(res.getStartDate(), res.getEndDate());
            if (days < 1) days = 1;
        }
        
        BigDecimal co2Saved = co2Calculator.executeCalculation(
                res.getItem().getCategory().getName(), 
                days, 
                res.getItem().getCategory().getCo2PerUnit()
        );
        
        userService.addEcoScore(res.getBorrower().getId(), co2Saved);
        userService.addEcoScore(res.getItem().getOwner().getId(), co2Saved);
    }
}
