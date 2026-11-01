package com.partage.voisins.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RatingResponseDTO {
    private UUID id;
    private Integer score;
    private String comment;
    private String evaluatorName;
    private LocalDateTime createdAt;
}
