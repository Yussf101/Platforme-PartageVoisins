package com.partage.voisins.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationRequestDTO {
    private UUID itemId;
    private UUID borrowerId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
