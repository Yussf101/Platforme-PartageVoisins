package com.partage.voisins.controller;

import com.partage.voisins.config.JwtUtil;
import com.partage.voisins.dto.auth.AuthRequestDTO;
import com.partage.voisins.dto.auth.AuthResponseDTO;
import com.partage.voisins.dto.auth.RegisterRequestDTO;
import com.partage.voisins.entity.User;
import com.partage.voisins.entity.enums.Role;
import com.partage.voisins.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Cet email est déjà utilisé.");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .trustScore(BigDecimal.valueOf(5.0))
                .ecoScore(BigDecimal.ZERO)
                .isActive(true)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId().toString());

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDTO request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId().toString());

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                String email = jwtUtil.extractEmail(token);
                Optional<User> userOptional = userRepository.findByEmail(email);
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    return ResponseEntity.ok(AuthResponseDTO.builder()
                            .token(token) // on renvoie le même pour simplifier
                            .userId(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .role(user.getRole().name())
                            .build());
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide ou manquant.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide.");
        }
    }
}
