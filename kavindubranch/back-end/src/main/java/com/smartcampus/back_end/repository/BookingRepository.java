package com.smartcampus.back_end.repository;

import com.smartcampus.back_end.model.Booking;
import com.smartcampus.back_end.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

// Repository interface for Booking entity
// Extends JpaRepository to provide CRUD operations
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Get all bookings for a specific user
    List<Booking> findByUserId(Long userId);

    // Get all bookings for a specific resource (e.g., room/lab)
    List<Booking> findByResourceId(Long resourceId);

    // Check if any booking exists for a given resource
    boolean existsByResourceId(Long resourceId);

    // Find overlapping bookings for a resource on a specific date and time range
    // Used to prevent double-booking conflicts
    @Query("""
            select b from Booking b
            where b.resource.id = :resourceId
              and b.date = :date

              // Only consider active bookings
              and b.status in (
                    com.smartcampus.back_end.model.BookingStatus.PENDING,
                    com.smartcampus.back_end.model.BookingStatus.APPROVED,
                    com.smartcampus.back_end.model.BookingStatus.CHECKED_IN
              )

              // Check time overlap condition
              and b.startTime < :endTime
              and b.endTime > :startTime
            """)
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    // Get all bookings with optional filters (status, date, resource)
    // If a parameter is null, it is ignored
    @Query("""
            select b from Booking b
            where (:status is null or b.status = :status)
              and (:date is null or b.date = :date)
              and (:resourceId is null or b.resource.id = :resourceId)
            order by b.createdAt desc
            """)
    List<Booking> findAllWithFilters(
            @Param("status") BookingStatus status,
            @Param("date") LocalDate date,
            @Param("resourceId") Long resourceId
    );

    // Count bookings by a specific status (e.g., APPROVED, PENDING)
    long countByStatus(BookingStatus status);

    // Find booking using hashed QR check-in token
    Optional<Booking> findByCheckInTokenHash(String checkInTokenHash);

    // Get number of bookings per resource (for analytics)
    // Returns: [resourceName, bookingCount]
    @Query("select b.resource.name, count(b) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN) group by b.resource.name order by count(b) desc")
    List<Object[]> findResourceBookingCounts();

    // Get number of bookings grouped by hour (for peak hour analysis)
    // Returns: [hour, bookingCount]
    @Query("select HOUR(b.startTime), count(b) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN) group by HOUR(b.startTime) order by count(b) desc")
    List<Object[]> findBookingCountsByHour();

    // Count distinct resources that have been booked (for analytics)
    @Query("select count(distinct b.resource.id) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN)")
    long countDistinctResourceId();
}