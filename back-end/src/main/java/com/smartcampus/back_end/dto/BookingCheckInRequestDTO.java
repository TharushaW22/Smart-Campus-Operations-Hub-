package com.smartcampus.back_end.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BookingCheckInRequestDTO {

    @NotBlank(message = "token is required")
    private String token;
}
