package com.smartcampus.back_end.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // TICKET_CREATED, STATUS_UPDATED, ASSIGNED, COMMENT_ADDED

    private Long ticketId; // reference to related ticket for deep-linking

    private Long bookingId; // reference to related booking for deep-linking

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Notification(User user, String message, String type, Long ticketId) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.ticketId = ticketId;
    }

    public Notification(User user, String message, String type, Long ticketId, Long bookingId) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.ticketId = ticketId;
        this.bookingId = bookingId;
    }
}
