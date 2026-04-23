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

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

        boolean existsByResourceId(Long resourceId);

    @Query("""
            select b from Booking b
            where b.resource.id = :resourceId
              and b.date = :date
                                                        and b.status in (
                                                                com.smartcampus.back_end.model.BookingStatus.PENDING,
                                                                com.smartcampus.back_end.model.BookingStatus.APPROVED,
                                                                com.smartcampus.back_end.model.BookingStatus.CHECKED_IN
                                                        )
              and b.startTime < :endTime
              and b.endTime > :startTime
            """)
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

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

    long countByStatus(BookingStatus status);

        Optional<Booking> findByCheckInTokenHash(String checkInTokenHash);

        @Query("select b.resource.name, count(b) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN) group by b.resource.name order by count(b) desc")
    List<Object[]> findResourceBookingCounts();

        @Query("select HOUR(b.startTime), count(b) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN) group by HOUR(b.startTime) order by count(b) desc")
    List<Object[]> findBookingCountsByHour();

        @Query("select count(distinct b.resource.id) from Booking b where b.status in (com.smartcampus.back_end.model.BookingStatus.APPROVED, com.smartcampus.back_end.model.BookingStatus.CHECKED_IN)")
    long countDistinctResourceId();
}
