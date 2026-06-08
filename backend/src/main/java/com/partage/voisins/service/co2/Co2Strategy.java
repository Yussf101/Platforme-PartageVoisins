package com.partage.voisins.service.co2;

import java.math.BigDecimal;

public interface Co2Strategy {
    BigDecimal calculate(int durationDays, BigDecimal co2PerUnit);
}
