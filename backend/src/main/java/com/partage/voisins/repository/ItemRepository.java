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

    // Trouver les objets d'un utilisateur (sauf supprimés)
    List<Item> findByOwnerIdAndStatusNotOrderByCreatedAtDesc(UUID ownerId, com.partage.voisins.entity.enums.ItemStatus status);

    // Requête PostGIS native pour trouver des objets disponibles dans un certain rayon
    @Query(value = """
        SELECT i.* FROM items i
        INNER JOIN users u ON i.owner_id = u.id
        WHERE i.status = 'AVAILABLE'
        AND u.is_active = true
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

    // Recherche avec filtres : mot-clé, catégorie et type de partage
    @Query(value = """
        SELECT i.* FROM items i
        INNER JOIN users u ON i.owner_id = u.id
        WHERE i.status = 'AVAILABLE'
        AND u.is_active = true
        AND ST_DWithin(
            i.coordinates::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radiusMeters
        )
        AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (CAST(:categoryId AS bigint) IS NULL OR i.category_id = CAST(:categoryId AS bigint))
        AND (:sharingType IS NULL OR i.sharing_type = :sharingType)
        AND (CAST(:currentUserId AS varchar) IS NULL OR CAST(i.owner_id AS varchar) != CAST(:currentUserId AS varchar))
    """, nativeQuery = true)
    List<Item> findAvailableItemsWithFilters(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("sharingType") String sharingType,
            @Param("currentUserId") String currentUserId
    );

    List<Item> findByOwnerId(UUID ownerId);
}
