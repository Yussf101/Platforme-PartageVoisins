package com.partage.voisins.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDTO {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}
