package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.dto.BookingAnalyticsDTO;
import com.smartcampus.back_end.dto.BookingCheckInRequestDTO;
import com.smartcampus.back_end.dto.BookingCheckInTokenResponseDTO;
import com.smartcampus.back_end.dto.BookingRequestDTO;
import com.smartcampus.back_end.dto.BookingResponseDTO;
import com.smartcampus.back_end.dto.BookingStatusUpdateDTO;
import com.smartcampus.back_end.model.Booking;
import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal String email) {

        BookingResponseDTO created = bookingService.createBooking(dto, email);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.getUserBookings(email));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Long resourceId) {

        return ResponseEntity.ok(bookingService.getAllBookings(status, date, resourceId));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(bookingService.getBookingAnalytics());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal String email,
            Authentication authentication) {

        Booking booking = bookingService.getBookingEntityById(id);

        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + Role.ADMIN.name()));

        if (!isAdmin && (booking.getUser() == null || booking.getUser().getEmail() == null
                || !booking.getUser().getEmail().equals(email))) {
            throw new AccessDeniedException("You can only view your own bookings");
        }

        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateDTO dto,
            @AuthenticationPrincipal String email) {

        return ResponseEntity.ok(bookingService.updateBookingStatus(id, dto, email));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal String email) {

        return ResponseEntity.ok(bookingService.updateBooking(id, dto, email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {

        bookingService.deleteBooking(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/checkin-token")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingCheckInTokenResponseDTO> generateCheckInToken(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {

        return ResponseEntity.ok(bookingService.generateCheckInToken(id, email));
    }

    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<BookingResponseDTO> checkInByToken(
            @Valid @RequestBody BookingCheckInRequestDTO dto) {

        return ResponseEntity.ok(bookingService.checkInByToken(dto.getToken()));
    }
}
