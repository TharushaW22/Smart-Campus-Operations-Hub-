package com.smartcampus.back_end.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder
public class TicketResponseDTO {
    private Long id;
    private String resourceLocation;
    private String category;
    private String description;
    private String priority;
    private String preferredContactDetails;
    private List<String> images;
    private Long creatorId;
    private String creatorName;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private String status;
    private String resolutionNote;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
