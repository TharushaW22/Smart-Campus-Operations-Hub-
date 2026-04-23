package com.smartcampus.back_end.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor
public class NotificationPreferenceDTO {
    // Types in this set are DISABLED; absent types are enabled
    private Set<String> disabledTypes = new HashSet<>();
}
