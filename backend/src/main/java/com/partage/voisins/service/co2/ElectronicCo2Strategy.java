package com.partage.voisins.service.co2;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component("electronicCo2Strategy")
public class ElectronicCo2Strategy implements Co2Strategy {

    @Override
    public BigDecimal calculate(int durationDays, BigDecimal co2PerUnit) {
        // L'électronique a un coût carbone de fabrication énorme.
        // On considère un gain de base important, plus un petit bonus par jour de durée de vie prolongée.
        BigDecimal baseSaving = co2PerUnit.multiply(BigDecimal.valueOf(0.8)); // 80% du coût de fabrication sauvé
        BigDecimal dailyBonus = BigDecimal.valueOf(durationDays).multiply(BigDecimal.valueOf(0.5));
        
        return baseSaving.add(dailyBonus);
    }
}
