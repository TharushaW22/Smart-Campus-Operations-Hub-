package com.smartcampus.back_end.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class BookingCheckInTokenResponseDTO {

    private Long bookingId;

    /**
     * Plaintext token to be encoded in the QR code.
     * Never stored in the database.
     */
    private String token;

    private LocalDateTime expiresAt;
}
