package com.partage.voisins.controller;

import com.partage.voisins.entity.Category;
import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.Location;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.ItemCondition;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.entity.enums.Role;
import com.partage.voisins.entity.enums.SharingType;
import com.partage.voisins.repository.CategoryRepository;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.LocationRepository;
import com.partage.voisins.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    
    private final Random random = new Random();

    @PostMapping("/seed")
    @Transactional
    public ResponseEntity<?> seedItemsNearby(@RequestBody Map<String, Double> payload) {
        Double lat = payload.get("lat");
        Double lng = payload.get("lng");

        if (lat == null || lng == null) {
            return ResponseEntity.badRequest().body("lat and lng are required");
        }

        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

        // Récupérer une catégorie (ou créer si n'existe pas)
        Category cat = categoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            Category c = Category.builder().name("Divers").co2PerUnit(new BigDecimal("10.0")).build();
            return categoryRepository.save(c);
        });

        // Créer un utilisateur "Local Voisin"
        Point pointUser = geometryFactory.createPoint(new Coordinate(lng, lat));
        Location locUser = Location.builder().coordinates(pointUser).latitude(lat).longitude(lng).build();
        locationRepository.save(locUser);

        User localUser = User.builder()
                .firstName("Voisin")
                .lastName("Local")
                .email("voisin.local." + random.nextInt(1000) + "@example.com")
                .passwordHash("pwd")
                .role(Role.USER)
                .isActive(true)
                .location(locUser)
                .build();
        userRepository.save(localUser);

        // Créer 5 objets autour avec un léger décalage (max ~2km)
        String[] titles = {"Appareil à raclette", "Échelle", "Perceuse", "Raquettes de tennis", "Livre de cuisine"};
        
        for (int i = 0; i < 5; i++) {
            double offsetLat = lat + (random.nextDouble() - 0.5) * 0.04; // Environ 2km de décalage max
            double offsetLng = lng + (random.nextDouble() - 0.5) * 0.04;
            
            Point p = geometryFactory.createPoint(new Coordinate(offsetLng, offsetLat));
            Location loc = Location.builder().coordinates(p).latitude(offsetLat).longitude(offsetLng).build();
            locationRepository.save(loc);

            Item item = Item.builder()
                    .owner(localUser)
                    .category(cat)
                    .title(titles[i % titles.length])
                    .description("Généré dynamiquement pour tester la carte.")
                    .itemCondition(ItemCondition.GOOD)
                    .sharingType(i % 2 == 0 ? SharingType.LOAN : SharingType.DONATION)
                    .status(ItemStatus.AVAILABLE)
                    .location(loc)
                    .coordinates(p)
                    .build();
            itemRepository.save(item);
        }

        return ResponseEntity.ok(Map.of("message", "5 objets générés avec succès !"));
    }
}
