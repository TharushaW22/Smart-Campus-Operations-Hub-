package com.smartcampus.back_end.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_notification_preferences")
@Getter @Setter @NoArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    // Types stored here are DISABLED — absence means enabled (default: all on)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_notification_disabled_types",
            joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "type")
    private Set<String> disabledTypes = new HashSet<>();

    public NotificationPreference(Long userId) {
        this.userId = userId;
    }

    public boolean isEnabled(String type) {
        return !disabledTypes.contains(type);
    }
}
