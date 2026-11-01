package com.partage.voisins.repository;

import com.partage.voisins.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByItemId(UUID itemId);
}
