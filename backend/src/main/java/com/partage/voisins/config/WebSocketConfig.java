package com.partage.voisins.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Active un broker en mémoire pour rediriger les messages aux clients abonnés
        config.enableSimpleBroker("/topic", "/queue");
        
        // Préfixe pour les messages envoyés DU client VERS le serveur
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Le point de connexion initial pour les clients (Next.js)
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("http://localhost:3000") // Autorise Next.js
                .withSockJS(); // Fallback si le navigateur ne gère pas WebSocket
    }
}
