package com.smartcampus.back_end.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class BookingRequestDTO {

    @NotNull(message = "resourceId is required")
    private Long resourceId;

    @NotNull(message = "date is required")
    private LocalDate date;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotBlank(message = "purpose is required")
    private String purpose;

    @NotNull(message = "expectedAttendees is required")
    @Min(value = 1, message = "expectedAttendees must be at least 1")
    private Integer expectedAttendees;
}
