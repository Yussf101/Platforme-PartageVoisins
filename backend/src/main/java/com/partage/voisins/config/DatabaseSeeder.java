package com.partage.voisins.config;

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
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

            // === 1. Création des Locations (autour de Paris par défaut) ===
            // Youssef (Rabat Centre)
            Point pointYoussef = geometryFactory.createPoint(new Coordinate(-6.841650, 34.020882)); // longitude, latitude
            Location locYoussef = Location.builder().coordinates(pointYoussef).latitude(34.020882).longitude(-6.841650).build();
            locationRepository.save(locYoussef);

            // Câble HDMI Youssef (Légèrement décalé pour éviter la superposition avec la perceuse)
            Point pointYoussefCable = geometryFactory.createPoint(new Coordinate(-6.842650, 34.021882));
            Location locYoussefCable = Location.builder().coordinates(pointYoussefCable).latitude(34.021882).longitude(-6.842650).build();
            locationRepository.save(locYoussefCable);

            // Tarik (Légèrement décalé dans Rabat)
            Point pointTarik = geometryFactory.createPoint(new Coordinate(-6.831650, 34.010882));
            Location locTarik = Location.builder().coordinates(pointTarik).latitude(34.010882).longitude(-6.831650).build();
            locationRepository.save(locTarik);

            // === 2. Création des Utilisateurs ===
            User youssef = User.builder()
                    .firstName("Youssef")
                    .lastName("Fatimi")
                    .email("youssef@example.com")
                    .passwordHash("password_mock") // Hash mocké pour dev
                    .role(Role.USER)
                    .isActive(true)
                    .ecoScore(new BigDecimal("150.5"))
                    .trustScore(new BigDecimal("4.8"))
                    .location(locYoussef)
                    .build();
            userRepository.save(youssef);

            User tarik = User.builder()
                    .firstName("Tarik")
                    .lastName("Aftys")
                    .email("tarik@example.com")
                    .passwordHash("password_mock")
                    .role(Role.USER)
                    .isActive(true)
                    .ecoScore(new BigDecimal("12.0"))
                    .trustScore(new BigDecimal("5.0"))
                    .location(locTarik)
                    .build();
            userRepository.save(tarik);

            // === 3. Création des Catégories ===
            Category catBrico = Category.builder().name("Bricolage").co2PerUnit(new BigDecimal("50.0")).build();
            Category catJardin = Category.builder().name("Jardinage").co2PerUnit(new BigDecimal("80.0")).build();
            Category catElectro = Category.builder().name("Électronique").co2PerUnit(new BigDecimal("120.0")).build();
            
            categoryRepository.save(catBrico);
            categoryRepository.save(catJardin);
            categoryRepository.save(catElectro);

            // === 4. Création des Objets (Items) ===
            Item perceuse = Item.builder()
                    .owner(youssef)
                    .category(catBrico)
                    .title("Perceuse sans fil Bosch")
                    .description("Perceuse avec 2 batteries et un jeu de mèches.")
                    .itemCondition(ItemCondition.GOOD)
                    .sharingType(SharingType.LOAN) // Prêt
                    .deposit(new BigDecimal("50.0"))
                    .status(ItemStatus.AVAILABLE)
                    .location(locYoussef)
                    .coordinates(pointYoussef)
                    .build();
            itemRepository.save(perceuse);

            Item tondeuse = Item.builder()
                    .owner(tarik)
                    .category(catJardin)
                    .title("Tondeuse électrique")
                    .description("Parfaite pour les petits jardins.")
                    .itemCondition(ItemCondition.GOOD)
                    .sharingType(SharingType.RENTAL) // Location
                    .rentalPrice(new BigDecimal("15.0"))
                    .deposit(new BigDecimal("100.0"))
                    .status(ItemStatus.AVAILABLE)
                    .location(locTarik)
                    .coordinates(pointTarik)
                    .build();
            itemRepository.save(tondeuse);

            Item cable = Item.builder()
                    .owner(youssef)
                    .category(catElectro)
                    .title("Câble HDMI 2m")
                    .description("Câble HDMI très bon état, je n'en ai plus besoin.")
                    .itemCondition(ItemCondition.GOOD)
                    .sharingType(SharingType.DONATION) // Don
                    .status(ItemStatus.AVAILABLE)
                    .location(locYoussefCable)
                    .coordinates(pointYoussefCable)
                    .build();
            itemRepository.save(cable);
            
            System.out.println("✅ Jeu de données (Youssef & Tarik) inséré avec succès dans la base !");
        }
    }
}
