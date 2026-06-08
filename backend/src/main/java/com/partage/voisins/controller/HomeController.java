package com.partage.voisins.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Bienvenue sur l'API de PartageVoisins ! Le backend Spring Boot fonctionne parfaitement. 🚀";
    }
}
