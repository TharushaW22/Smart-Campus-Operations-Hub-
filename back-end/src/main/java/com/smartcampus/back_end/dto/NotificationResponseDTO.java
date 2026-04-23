package com.smartcampus.back_end.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @Builder
public class NotificationResponseDTO {
    private Long id;
    private String message;
    private String type;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long ticketId;
    private Long bookingId;
}
