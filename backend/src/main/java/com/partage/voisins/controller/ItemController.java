package com.partage.voisins.controller;

import com.partage.voisins.dto.ItemResponseDTO;
import com.partage.voisins.entity.Item;
import com.partage.voisins.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping("/nearby")
    public ResponseEntity<List<ItemResponseDTO>> getNearbyItems(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radiusKm) {
            
        List<Item> items = itemService.getAvailableItemsNearby(lat, lng, radiusKm);
        
        List<ItemResponseDTO> dtos = items.stream().map(item -> ItemResponseDTO.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .itemCondition(item.getItemCondition())
                .sharingType(item.getSharingType())
                .rentalPrice(item.getRentalPrice())
                .deposit(item.getDeposit())
                .status(item.getStatus())
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .ownerId(item.getOwner().getId())
                .ownerName(item.getOwner().getFirstName() + " " + item.getOwner().getLastName())
                .latitude(item.getLocation() != null ? item.getLocation().getLatitude() : null)
                .longitude(item.getLocation() != null ? item.getLocation().getLongitude() : null)
                .build()).collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }
}
