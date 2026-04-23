package com.smartcampus.back_end.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BookingAnalyticsDTO {

    private long totalBookings;
    private long approvedBookings;
    private long pendingBookings;
    private long uniqueResourcesBooked;

    private List<ResourceUsage> topResources;
    private List<PeakHour> peakHours;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ResourceUsage {
        private String resourceName;
        private long bookingCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PeakHour {
        private String hourLabel;
        private long bookings;
    }
}
