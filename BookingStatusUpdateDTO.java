package com.smartcampus.back_end.dto;

import com.smartcampus.back_end.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BookingStatusUpdateDTO {

    @NotNull(message = "status is required")
    private BookingStatus status;

    private String adminReason;
}
