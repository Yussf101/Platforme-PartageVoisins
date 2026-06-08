package com.partage.voisins.service.co2;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component("defaultCo2Strategy")
public class DefaultCo2Strategy implements Co2Strategy {

    @Override
    public BigDecimal calculate(int durationDays, BigDecimal co2PerUnit) {
        // Formule de base: on multiplie la durée par un ratio par rapport au coût de production
        return co2PerUnit.multiply(BigDecimal.valueOf(durationDays)).multiply(BigDecimal.valueOf(0.01));
    }
}
