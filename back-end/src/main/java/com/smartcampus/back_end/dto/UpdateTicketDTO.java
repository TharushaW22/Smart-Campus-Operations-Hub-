package com.smartcampus.back_end.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateTicketDTO {
    private String status;
    private String resolutionNote;
    private String rejectionReason;
}
