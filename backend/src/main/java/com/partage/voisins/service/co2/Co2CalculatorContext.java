package com.partage.voisins.service.co2;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class Co2CalculatorContext {

    private final Map<String, Co2Strategy> strategies;

    public Co2CalculatorContext(Map<String, Co2Strategy> strategies) {
        this.strategies = strategies;
    }

    public BigDecimal executeCalculation(String categoryName, int durationDays, BigDecimal co2PerUnit) {
        String strategyName = getStrategyNameForCategory(categoryName);
        Co2Strategy strategy = strategies.getOrDefault(strategyName, strategies.get("defaultCo2Strategy"));
        return strategy.calculate(durationDays, co2PerUnit);
    }

    private String getStrategyNameForCategory(String categoryName) {
        if (categoryName == null) return "defaultCo2Strategy";
        
        return switch (categoryName.toLowerCase()) {
            case "electronique", "electronic" -> "electronicCo2Strategy";
            default -> "defaultCo2Strategy";
        };
    }
}
