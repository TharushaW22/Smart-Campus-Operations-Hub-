package com.smartcampus.back_end.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity // Marks this class as a JPA entity (mapped to a database table)
@Table(name = "bookings") // Table name in DB
@Getter // Lombok: generates getters
@Setter // Lombok: generates setters
@NoArgsConstructor // Lombok: generates no-args constructor
public class Booking {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    // Many bookings can belong to one user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false) // Foreign key column
    private User user;

    // Many bookings can belong to one resource (e.g., room, lab, etc.)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false) // Foreign key column
    private Resource resource;

    // Booking date
    @Column(nullable = false)
    private LocalDate date;

    // Start time of booking
    @Column(nullable = false)
    private LocalTime startTime;

    // End time of booking
    @Column(nullable = false)
    private LocalTime endTime;

    // Purpose of booking (why user booked the resource)
    @Column(nullable = false, length = 1000)
    private String purpose;

    // Expected number of attendees
    @Column(nullable = false)
    private Integer expectedAttendees;

    // Booking status (PENDING, APPROVED, REJECTED, etc.)
    @Enumerated(EnumType.STRING) // Store enum as string in DB
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    // Reason given by admin when approving/rejecting
    @Column(length = 1000)
    private String adminReason;

    // Hashed token used for secure check-in
    @Column(length = 64, unique = true)
    private String checkInTokenHash;

    // Expiry time for check-in token
    private LocalDateTime checkInTokenExpiresAt;

    // Time when user actually checked in
    private LocalDateTime checkedInAt;

    // Timestamp when booking is created (cannot be updated later)
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Timestamp when booking is last updated
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Runs before inserting into DB
    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        
        // Set created time only once
        if (createdAt == null) {
            createdAt = now;
        }

        // Always update updatedAt
        updatedAt = now;

        // Ensure default status is PENDING
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }

    // Runs before updating existing record
    @PreUpdate
    void preUpdate() {
        // Update last modified time
        updatedAt = LocalDateTime.now();
    }
}