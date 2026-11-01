package com.partage.voisins.service;

import com.partage.voisins.dto.ConversationListDTO;
import com.partage.voisins.dto.MessageResponseDTO;
import com.partage.voisins.entity.Conversation;
import com.partage.voisins.entity.Message;
import com.partage.voisins.entity.User;
import com.partage.voisins.repository.ConversationRepository;
import com.partage.voisins.repository.MessageRepository;
import com.partage.voisins.repository.UserRepository;
import com.partage.voisins.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;

    public List<ConversationListDTO> getUserConversations(UUID userId) {
        // Find conversations where the user is either the borrower or the owner of the item
        List<Conversation> allConversations = conversationRepository.findAll();
        
        return allConversations.stream()
                .filter(c -> c.getReservation().getBorrower().getId().equals(userId) ||
                             c.getReservation().getItem().getOwner().getId().equals(userId))
                .sorted((c1, c2) -> {
                    LocalDateTime t1 = c1.getMessages().isEmpty() ? c1.getCreatedAt() : c1.getMessages().get(c1.getMessages().size() - 1).getSentAt();
                    LocalDateTime t2 = c2.getMessages().isEmpty() ? c2.getCreatedAt() : c2.getMessages().get(c2.getMessages().size() - 1).getSentAt();
                    return t2.compareTo(t1);
                })
                .map(c -> {
                    boolean isOwner = c.getReservation().getItem().getOwner().getId().equals(userId);
                    User otherUser = isOwner ? c.getReservation().getBorrower() : c.getReservation().getItem().getOwner();
                    
                    String lastMsg = "Aucun message";
                    java.time.LocalDateTime lastMsgAt = c.getCreatedAt();
                    if (!c.getMessages().isEmpty()) {
                        Message last = c.getMessages().get(c.getMessages().size() - 1);
                        lastMsg = last.getContent();
                        lastMsgAt = last.getSentAt();
                    }
                    boolean hasRated = ratingRepository.existsByReservationIdAndEvaluatorId(c.getReservation().getId(), userId);

                    return ConversationListDTO.builder()
                            .id(c.getId())
                            .reservationId(c.getReservation().getId())
                            .itemId(c.getReservation().getItem().getId())
                            .itemTitle(c.getReservation().getItem().getTitle())
                            .otherUserId(otherUser.getId())
                            .otherUserName(otherUser.getFirstName() + " " + otherUser.getLastName())
                            .lastMessage(lastMsg)
                            .lastMessageAt(lastMsgAt)
                            .reservationStatus(c.getReservation().getStatus())
                            .isOwner(isOwner)
                            .hasRated(hasRated)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public long getUnreadMessageCount(UUID userId) {
        return messageRepository.countUnreadMessagesForUser(userId);
    }

    public List<MessageResponseDTO> getConversationMessages(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

        // Vérifier l'accès
        boolean isOwner = conversation.getReservation().getItem().getOwner().getId().equals(userId);
        boolean isBorrower = conversation.getReservation().getBorrower().getId().equals(userId);
        if (!isOwner && !isBorrower) {
            throw new RuntimeException("Non autorisé à voir cette conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        
        // Marquer les messages comme lus si le destinataire les consulte
        boolean changed = false;
        for (Message m : messages) {
            if (!m.getSender().getId().equals(userId) && !m.isRead()) {
                m.setRead(true);
                changed = true;
            }
        }
        if (changed) {
            messageRepository.saveAll(messages);
        }

        return messages.stream()
                .map(m -> MessageResponseDTO.builder()
                        .id(m.getId())
                        .senderId(m.getSender().getId())
                        .senderName(m.getSender().getFirstName())
                        .content(m.getContent())
                        .sentAt(m.getSentAt())
                        .isRead(m.isRead())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponseDTO sendMessage(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build();
        
        Message saved = messageRepository.save(message);

        return MessageResponseDTO.builder()
                .id(saved.getId())
                .senderId(sender.getId())
                .senderName(sender.getFirstName())
                .content(saved.getContent())
                .sentAt(saved.getSentAt())
                .isRead(saved.isRead())
                .build();
    }
}
