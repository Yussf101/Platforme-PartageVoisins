package com.partage.voisins.service;

import com.partage.voisins.entity.Item;
import com.partage.voisins.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public Item getItemById(UUID id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public List<Item> getAvailableItemsNearby(double lat, double lng, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        // Appel à la requête PostGIS native
        return itemRepository.findAvailableItemsNearby(lat, lng, radiusMeters);
    }

    public Item createItem(Item item) {
        return itemRepository.save(item);
    }
}
