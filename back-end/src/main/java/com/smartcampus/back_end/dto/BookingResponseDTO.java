package com.smartcampus.back_end.dto;

import com.smartcampus.back_end.model.BookingStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class BookingResponseDTO {

    private Long id;

    private Long userId;
    private String userName;

    private Long resourceId;
    private String resourceName;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;
    private String adminReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private LocalDateTime checkedInAt;
}
