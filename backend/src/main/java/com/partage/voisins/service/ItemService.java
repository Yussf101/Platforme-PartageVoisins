package com.partage.voisins.service;

import com.partage.voisins.entity.Category;
import com.partage.voisins.entity.Item;
import com.partage.voisins.entity.Location;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.ItemStatus;
import com.partage.voisins.repository.CategoryRepository;
import com.partage.voisins.repository.ItemRepository;
import com.partage.voisins.repository.LocationRepository;
import com.partage.voisins.repository.PhotoRepository;
import com.partage.voisins.repository.UserRepository;
import com.partage.voisins.dto.ItemRequestDTO;
import com.partage.voisins.entity.Photo;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PhotoRepository photoRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public Item getItemById(UUID id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public List<Item> getAvailableItemsNearby(double lat, double lng, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        // Appel à la requête PostGIS native
        return itemRepository.findAvailableItemsNearby(lat, lng, radiusMeters);
    }

    public List<Item> searchItems(double lat, double lng, double radiusKm,
                                   String keyword, Long categoryId, String sharingType, String currentUserId) {
        double radiusMeters = radiusKm * 1000;
        String kw = (keyword != null && keyword.isBlank()) ? null : keyword;
        String st = (sharingType != null && sharingType.isBlank()) ? null : sharingType;
        
        return itemRepository.findAvailableItemsWithFilters(lat, lng, radiusMeters, kw, categoryId, st, currentUserId);
    }

    public List<Item> getMyItems(UUID ownerId) {
        return itemRepository.findByOwnerIdAndStatusNotOrderByCreatedAtDesc(ownerId, ItemStatus.DELETED);
    }

    @Transactional
    public Item createItem(ItemRequestDTO dto, java.util.UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        // Créer l'entité Location
        Point point = geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude()));
        Location location = Location.builder()
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .coordinates(point)
                .build();
        location = locationRepository.save(location);

        // Créer l'entité Item
        Item item = Item.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .itemCondition(dto.getItemCondition())
                .sharingType(dto.getSharingType())
                .rentalPrice(dto.getRentalPrice())
                .deposit(dto.getDeposit())
                .status(ItemStatus.AVAILABLE)
                .owner(owner)
                .category(category)
                .location(location)
                .coordinates(point)
                .build();

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(UUID itemId, UUID ownerId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));

        if (!item.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Non autorisé à supprimer cet objet");
        }

        item.setStatus(ItemStatus.DELETED);
        itemRepository.save(item);
    }

    @Transactional
    public Item changeItemStatus(UUID itemId, UUID ownerId, ItemStatus newStatus) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));

        if (!item.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Non autorisé à modifier cet objet");
        }

        item.setStatus(newStatus);
        return itemRepository.save(item);
    }

    @Transactional
    public Item updateItem(UUID itemId, UUID ownerId, ItemRequestDTO dto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));

        if (!item.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Non autorisé à modifier cet objet");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        item.setTitle(dto.getTitle());
        item.setDescription(dto.getDescription());
        item.setCategory(category);
        item.setItemCondition(dto.getItemCondition());
        item.setSharingType(dto.getSharingType());
        item.setRentalPrice(dto.getRentalPrice());
        item.setDeposit(dto.getDeposit());

        // Update location if changed (assuming UI sends the new lat/lng)
        Point newPoint = geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude()));
        Location location = item.getLocation();
        if (location == null) {
             location = Location.builder()
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .coordinates(newPoint)
                .build();
             location = locationRepository.save(location);
             item.setLocation(location);
        } else {
             location.setLatitude(dto.getLatitude());
             location.setLongitude(dto.getLongitude());
             location.setCoordinates(newPoint);
             locationRepository.save(location);
        }
        item.setCoordinates(newPoint);

        return itemRepository.save(item);
    }

    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    @Transactional
    public List<Photo> uploadPhotos(UUID itemId, UUID ownerId, MultipartFile[] files) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));

        if (!item.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Non autorisé à modifier cet objet");
        }

        if (files == null || files.length == 0 || files.length > 5) {
            throw new IllegalArgumentException("Vous devez uploader entre 1 et 5 photos.");
        }

        Path uploadPath = Paths.get("uploads");
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la création du dossier uploads", e);
        }

        List<Photo> uploadedPhotos = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            try {
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
                String fileName = UUID.randomUUID().toString() + extension;
                
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);

                Photo photo = Photo.builder()
                        .item(item)
                        .url("/uploads/" + fileName)
                        .build();

                uploadedPhotos.add(photoRepository.save(photo));
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de la sauvegarde du fichier", e);
            }
        }

        return uploadedPhotos;
    }
}
