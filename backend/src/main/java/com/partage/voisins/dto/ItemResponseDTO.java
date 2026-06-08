package com.partage.voisins.dto;

import com.partage.voisins.entity.enums.ItemCondition;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.entity.enums.SharingType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ItemResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private ItemCondition itemCondition;
    private SharingType sharingType;
    private BigDecimal rentalPrice;
    private BigDecimal deposit;
    private ItemStatus status;
    private String categoryName;
    private UUID ownerId;
    private String ownerName;
    private Double latitude;
    private Double longitude;
}
