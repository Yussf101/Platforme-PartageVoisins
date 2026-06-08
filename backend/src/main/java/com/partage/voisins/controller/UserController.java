package com.partage.voisins.controller;

import com.partage.voisins.entity.User;
import com.partage.voisins.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<User> getUserProfile(@PathVariable UUID id) {
        // En vrai, il faudrait renvoyer un UserProfileDTO pour cacher le passwordHash
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
