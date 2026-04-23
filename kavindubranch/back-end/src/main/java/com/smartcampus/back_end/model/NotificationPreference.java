package com.smartcampus.back_end.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity // Marks this as a JPA entity
@Table(name = "user_notification_preferences") // Maps to DB table
@Getter 
@Setter 
@NoArgsConstructor // Lombok: generates no-args constructor
public class NotificationPreference {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    // Each user has one preference record (unique)
    @Column(nullable = false, unique = true)
    private Long userId;

    /*
     * Stores notification types that are DISABLED.
     * Important logic:
     * - If a type is NOT in this set → it is ENABLED
     * - Default behavior → all notifications are enabled
     */
    @ElementCollection(fetch = FetchType.EAGER) // Stores collection in separate table
    @CollectionTable(
        name = "user_notification_disabled_types", // Table for disabled types
        joinColumns = @JoinColumn(name = "preference_id") // FK to this entity
    )
    @Column(name = "type") // Column storing each disabled type
    private Set<String> disabledTypes = new HashSet<>();

    // Constructor to create preference for a user
    public NotificationPreference(Long userId) {
        this.userId = userId;
    }

    /*
     * Check if a notification type is enabled
     * Returns true → if NOT in disabled list
     * Returns false → if it is disabled
     */
    public boolean isEnabled(String type) {
        return !disabledTypes.contains(type);
    }
}