package com.smartcampus.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceSummaryDTO {
    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
}
