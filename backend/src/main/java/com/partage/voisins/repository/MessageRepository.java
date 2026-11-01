package com.partage.voisins.repository;

import com.partage.voisins.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id IN (SELECT c.id FROM Conversation c WHERE c.reservation.item.owner.id = :userId OR c.reservation.borrower.id = :userId) AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessagesForUser(@org.springframework.data.repository.query.Param("userId") UUID userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markAsRead(@org.springframework.data.repository.query.Param("conversationId") UUID conversationId, @org.springframework.data.repository.query.Param("userId") UUID userId);
}
