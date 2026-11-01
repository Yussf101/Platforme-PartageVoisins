package com.partage.voisins.controller;

import com.partage.voisins.entity.Report;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.ReportStatus;
import com.partage.voisins.entity.enums.Role;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.ReportRepository;
import com.partage.voisins.repository.UserRepository;
import com.partage.voisins.repository.ReservationRepository;
import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.Reservation;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.entity.enums.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ReportRepository reportRepository;
    private final ReservationRepository reservationRepository;

    // Simuler une protection très basique (en production, on utiliserait @PreAuthorize("hasAuthority('ADMIN')"))
    // Mais pour notre MVP, on vérifie via l'User du repository si on avait le token (ici simplifié)

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        long totalReports = reportRepository.count();
        
        // Calcul du CO2 total
        List<User> users = userRepository.findAll();
        BigDecimal totalCo2 = users.stream()
                .map(User::getEcoScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalItems", totalItems);
        stats.put("totalReports", totalReports);
        stats.put("totalCo2", totalCo2);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        var reports = reportRepository.findAll().stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("reason", r.getReason());
            map.put("status", r.getStatus().name());
            map.put("createdAt", r.getCreatedAt());
            if (r.getReportedItem() != null) {
                map.put("reportedItemId", r.getReportedItem().getId());
                map.put("reportedItemTitle", r.getReportedItem().getTitle());
            }
            if (r.getReportedUser() != null) {
                map.put("reportedUserId", r.getReportedUser().getId());
                map.put("reportedUserName", r.getReportedUser().getFirstName() + " " + r.getReportedUser().getLastName());
            }
            return map;
        }).toList();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        var users = userRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("firstName", u.getFirstName() != null ? u.getFirstName() : "");
            map.put("lastName", u.getLastName() != null ? u.getLastName() : "");
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("active", u.isActive());
            return map;
        }).toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable UUID id) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Signalement non trouvé."));
        }
        Report report = reportOpt.get();
        report.setStatus(ReportStatus.REVIEWED);
        reportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Signalement résolu."));
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable UUID id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé."));
        }
        User user = userOpt.get();
        user.setActive(!user.isActive()); // Toggle suspend
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", user.isActive() ? "Utilisateur réactivé." : "Utilisateur suspendu."));
    }

    @PostMapping("/items/{id}/hide")
    public ResponseEntity<?> hideItem(@PathVariable UUID id) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Objet non trouvé."));
        }
        Item item = itemOpt.get();
        item.setStatus(ItemStatus.UNAVAILABLE);
        itemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Objet masqué avec succès."));
    }

    @GetMapping("/disputes")
    public ResponseEntity<?> getDisputes() {
        var disputes = reservationRepository.findByStatus(ReservationStatus.DISPUTE).stream().map(res -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", res.getId());
            map.put("startDate", res.getStartDate());
            map.put("endDate", res.getEndDate());
            map.put("itemName", res.getItem().getTitle());
            map.put("ownerName", res.getItem().getOwner().getFirstName() + " " + res.getItem().getOwner().getLastName());
            map.put("borrowerName", res.getBorrower().getFirstName() + " " + res.getBorrower().getLastName());
            return map;
        }).toList();
        return ResponseEntity.ok(disputes);
    }

    @PostMapping("/reservations/{id}/resolve-dispute")
    public ResponseEntity<?> resolveDispute(@PathVariable UUID id) {
        Optional<Reservation> resOpt = reservationRepository.findById(id);
        if (resOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Réservation non trouvée."));
        }
        Reservation res = resOpt.get();
        res.setStatus(ReservationStatus.RESOLVED);
        // On libère l'objet
        res.getItem().setStatus(ItemStatus.AVAILABLE);
        reservationRepository.save(res);
        return ResponseEntity.ok(Map.of("message", "Litige clôturé avec succès."));
    }
}
