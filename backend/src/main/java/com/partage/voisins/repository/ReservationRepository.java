package com.partage.voisins.repository;

import com.partage.voisins.entity.Reservation;
import com.partage.voisins.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByBorrowerId(UUID borrowerId);
    List<Reservation> findByItemOwnerId(UUID ownerId);
    List<Reservation> findByItemIdAndStatusIn(UUID itemId, List<ReservationStatus> statuses);
}
