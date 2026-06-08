package com.partage.voisins.repository;

import com.partage.voisins.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {

    // Requête PostGIS native pour trouver des objets disponibles dans un certain rayon
    @Query(value = """
        SELECT * FROM items i
        WHERE i.status = 'AVAILABLE'
        AND ST_DWithin(
            i.coordinates::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radiusMeters
        )
    """, nativeQuery = true)
    List<Item> findAvailableItemsNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters
    );
    
    List<Item> findByOwnerId(UUID ownerId);
}
