package com.partage.voisins.config;

import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.Role;
import com.partage.voisins.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@partagevoisins.com";
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .firstName("Super")
                    .lastName("Admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .trustScore(BigDecimal.valueOf(5.0))
                    .ecoScore(BigDecimal.ZERO)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            System.out.println("Compte administrateur créé : " + adminEmail + " / admin123");
        } else {
            // S'assurer que le compte a bien le rôle ADMIN au cas où
            User admin = adminOpt.get();
            if (admin.getRole() != Role.ADMIN) {
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Le compte administrateur a été mis à jour avec le rôle ADMIN.");
            }
        }
    }
}
