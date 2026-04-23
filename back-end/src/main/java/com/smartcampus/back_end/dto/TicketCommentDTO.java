package com.smartcampus.back_end.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class TicketCommentDTO {
    private Long id;
    private Long ticketId;
    private Long authorId;
    private String authorName;
    private String authorPicture;
    private String authorRole;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
