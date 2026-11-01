package com.partage.voisins.dto;

import com.partage.voisins.entity.enums.ItemCondition;
import com.partage.voisins.entity.enums.SharingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemRequestDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categoryId;

    @NotNull(message = "La condition de l'objet est obligatoire")
    private ItemCondition itemCondition;

    @NotNull(message = "Le type de partage est obligatoire")
    private SharingType sharingType;

    private BigDecimal rentalPrice;

    private BigDecimal deposit;

    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;

    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;
}
