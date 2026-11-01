package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.ItemRequestDTO;
import com.partage.voisins.dto.ItemResponseDTO;
import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.UserRepository;
import com.partage.voisins.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final JwtUtil jwtUtil;
    private final com.partage.voisins.repository.ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final com.partage.voisins.repository.UserBadgeRepository userBadgeRepository;

    @GetMapping("/nearby")
    public ResponseEntity<List<ItemResponseDTO>> getNearbyItems(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radiusKm,
            @RequestHeader(value = "Authorization", required = false) String token) {
            
        String currentUserIdStr = extractUserIdFromToken(token);
        
        List<Item> items = itemService.searchItems(lat, lng, radiusKm, null, null, null, currentUserIdStr);
        return ResponseEntity.ok(toDtoList(items));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponseDTO>> searchItems(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10.0") double radiusKm,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sharingType,
            @RequestHeader(value = "Authorization", required = false) String token) {
            
        String currentUserIdStr = extractUserIdFromToken(token);
            
        List<Item> items = itemService.searchItems(lat, lng, radiusKm, keyword, categoryId, sharingType, currentUserIdStr);
        return ResponseEntity.ok(toDtoList(items));
    }

    private String extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtUtil.validateToken(jwt)) {
                return jwtUtil.extractAllClaims(jwt).get("userId", String.class);
            }
        }
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable UUID id) {
        try {
            Item item = itemService.getItemById(id);
            return ResponseEntity.ok(toDtoList(List.of(item)).get(0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Objet introuvable.");
        }
    }

    @PostMapping
    public ResponseEntity<?> createItem(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ItemRequestDTO request) {
        
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            
            String userIdStr = jwtUtil.extractAllClaims(jwt).get("userId", String.class);
            UUID ownerId = UUID.fromString(userIdStr);
            
            Item item = itemService.createItem(request, ownerId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(toDtoList(List.of(item)).get(0));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur lors de la création de l'objet : " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyItems(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            
            String userIdStr = jwtUtil.extractAllClaims(jwt).get("userId", String.class);
            UUID ownerId = UUID.fromString(userIdStr);
            
            List<Item> items = itemService.getMyItems(ownerId);
            return ResponseEntity.ok(toDtoList(items));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID ownerId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            itemService.deleteItem(id, ownerId);
            return ResponseEntity.ok("Objet supprimé avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody ItemRequestDTO request,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID ownerId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            Item item = itemService.updateItem(id, ownerId, request);
            return ResponseEntity.ok(toDtoList(List.of(item)).get(0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur lors de la modification : " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeItemStatus(
            @PathVariable UUID id,
            @RequestParam ItemStatus status,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID ownerId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            Item item = itemService.changeItemStatus(id, ownerId, status);
            return ResponseEntity.ok(toDtoList(List.of(item)).get(0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        }
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<?> uploadPhotos(
            @PathVariable UUID id,
            @RequestParam("photos") MultipartFile[] photos,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID ownerId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            itemService.uploadPhotos(id, ownerId, photos);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportItem(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant ou invalide.");
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
            }
            UUID reporterId = UUID.fromString(jwtUtil.extractAllClaims(jwt).get("userId", String.class));
            
            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La raison est requise.");
            }

            User reporter = userRepository.findById(reporterId).orElseThrow(() -> new RuntimeException("User not found"));
            Item item = itemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));

            com.partage.voisins.entity.Report report = com.partage.voisins.entity.Report.builder()
                    .reporter(reporter)
                    .reportedItem(item)
                    .reason(reason)
                    .status(com.partage.voisins.entity.enums.ReportStatus.PENDING)
                    .build();

            reportRepository.save(report);

            return ResponseEntity.ok(Map.of("message", "Signalement envoyé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private List<ItemResponseDTO> toDtoList(List<Item> items) {
        return items.stream().map(item -> {
            List<String> badges = userBadgeRepository.findByUserId(item.getOwner().getId())
                    .stream()
                    .map(b -> b.getBadgeType().name())
                    .collect(Collectors.toList());
                    
            return ItemResponseDTO.builder()
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
                .ownerFirstName(item.getOwner().getFirstName())
                .latitude(item.getLocation() != null ? item.getLocation().getLatitude() : null)
                .longitude(item.getLocation() != null ? item.getLocation().getLongitude() : null)
                .trustScore(item.getOwner().getTrustScore())
                .ownerBadges(badges)
                .co2Saved(item.getCategory() != null ? item.getCategory().getCo2PerUnit() : null)
                .photoUrls(item.getPhotos() != null ? item.getPhotos().stream().map(p -> p.getUrl()).collect(Collectors.toList()) : null)
                .build();
        }).collect(Collectors.toList());
    }
}
