package com.smartcampus.back_end.service;

import com.smartcampus.back_end.dto.NotificationPreferenceDTO;
import com.smartcampus.back_end.dto.NotificationResponseDTO;
import com.smartcampus.back_end.model.Booking;
import com.smartcampus.back_end.model.IncidentTicket;
import com.smartcampus.back_end.model.Notification;
import com.smartcampus.back_end.model.NotificationPreference;
import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.NotificationPreferenceRepository;
import com.smartcampus.back_end.repository.NotificationRepository;
import com.smartcampus.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    // ── Preference helpers ────────────────────────────────────────────────────

    private boolean isEnabled(User user, String type) {
        return preferenceRepository.findByUserId(user.getId())
                .map(p -> p.isEnabled(type))
                .orElse(true); // default: all notifications enabled
    }

    // ── Notification triggers ─────────────────────────────────────────────────

    /** Notify all admins when a new ticket is submitted. */
    public void notifyAdminsNewTicket(IncidentTicket ticket) {
        String message = "New ticket submitted by " + ticket.getCreator().getName()
                + ": [" + ticket.getCategory() + "] at " + ticket.getResourceLocation();

        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .filter(u -> isEnabled(u, "TICKET_CREATED"))
                .forEach(admin -> notificationRepository.save(
                        new Notification(admin, message, "TICKET_CREATED", ticket.getId())));
    }

    /** Notify the ticket creator when its status changes. */
    public void notifyCreatorStatusChanged(IncidentTicket ticket, String newStatus) {
        User creator = ticket.getCreator();
        if (!isEnabled(creator, "STATUS_UPDATED")) return;
        String message = "Your ticket [" + ticket.getCategory() + "] at "
                + ticket.getResourceLocation() + " status changed to: " + newStatus;
        notificationRepository.save(
                new Notification(creator, message, "STATUS_UPDATED", ticket.getId()));
    }

    /** Notify the assigned technician that a ticket has been assigned to them. */
    public void notifyTechnicianAssigned(IncidentTicket ticket, User technician) {
        if (!isEnabled(technician, "ASSIGNED")) return;
        String message = "You have been assigned to ticket [" + ticket.getCategory() + "] at "
                + ticket.getResourceLocation() + " (submitted by " + ticket.getCreator().getName() + ")";
        notificationRepository.save(
                new Notification(technician, message, "ASSIGNED", ticket.getId()));
    }

    /**
     * Notify relevant parties when a comment is added.
     * - Ticket creator is notified (unless they wrote the comment).
     * - Assigned technician is notified (unless they wrote the comment).
     * - All admins are notified (unless the admin wrote the comment).
     */
    public void notifyCommentAdded(IncidentTicket ticket, User commentAuthor) {
        String message = commentAuthor.getName() + " commented on ticket ["
                + ticket.getCategory() + "] at " + ticket.getResourceLocation();

        // Collect unique recipients: creator + assigned technician + all admins
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .collect(Collectors.toList());

        // Add creator if not already in list
        User creator = ticket.getCreator();
        if (recipients.stream().noneMatch(u -> u.getId().equals(creator.getId()))) {
            recipients.add(creator);
        }

        // Add assigned technician if present and not already in list
        User technician = ticket.getAssignedTechnician();
        if (technician != null && recipients.stream().noneMatch(u -> u.getId().equals(technician.getId()))) {
            recipients.add(technician);
        }

        // Send to everyone except the comment author, respecting preferences
        recipients.stream()
                .filter(u -> !u.getId().equals(commentAuthor.getId()))
                .filter(u -> isEnabled(u, "COMMENT_ADDED"))
                .forEach(u -> notificationRepository.save(
                        new Notification(u, message, "COMMENT_ADDED", ticket.getId())));
    }

    // ── Booking notification triggers ─────────────────────────────────────────

    /** Notify all admins when a user creates a new booking. */
    public void notifyAdminsNewBooking(Booking booking) {
        String message = booking.getUser().getName() + " requested a booking for \""
                + booking.getResource().getName() + "\" on " + booking.getDate()
                + " (" + booking.getStartTime() + " – " + booking.getEndTime() + ")";
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .filter(u -> isEnabled(u, "BOOKING_CREATED"))
                .forEach(admin -> notificationRepository.save(
                        new Notification(admin, message, "BOOKING_CREATED", null, booking.getId())));
    }

    /** Notify the booking creator that their booking was approved. */
    public void notifyUserBookingApproved(Booking booking) {
        User user = booking.getUser();
        if (!isEnabled(user, "BOOKING_APPROVED")) return;
        String message = "Your booking for \"" + booking.getResource().getName()
                + "\" on " + booking.getDate()
                + " (" + booking.getStartTime() + " – " + booking.getEndTime() + ") has been approved.";
        notificationRepository.save(
                new Notification(user, message, "BOOKING_APPROVED", null, booking.getId()));
    }

    /** Notify the booking creator that their booking was rejected, including the reason. */
    public void notifyUserBookingRejected(Booking booking) {
        User user = booking.getUser();
        if (!isEnabled(user, "BOOKING_REJECTED")) return;
        String message = "Your booking for \"" + booking.getResource().getName()
                + "\" on " + booking.getDate()
                + " (" + booking.getStartTime() + " – " + booking.getEndTime() + ") was rejected."
                + (booking.getAdminReason() != null ? " Reason: " + booking.getAdminReason() : "");
        notificationRepository.save(
                new Notification(user, message, "BOOKING_REJECTED", null, booking.getId()));
    }

    /** Notify all admins when a user cancels a booking. */
    public void notifyAdminsBookingCancelled(Booking booking) {
        String message = booking.getUser().getName() + " cancelled their booking for \""
                + booking.getResource().getName() + "\" on " + booking.getDate()
                + " (" + booking.getStartTime() + " – " + booking.getEndTime() + ")";
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .filter(u -> isEnabled(u, "BOOKING_CANCELLED"))
                .forEach(admin -> notificationRepository.save(
                        new Notification(admin, message, "BOOKING_CANCELLED", null, booking.getId())));
    }

    /** Notify all admins when a user updates a pending booking. */
    public void notifyAdminsBookingUpdated(Booking booking) {
        String message = booking.getUser().getName() + " updated a booking for \""
                + booking.getResource().getName() + "\" on " + booking.getDate()
                + " (" + booking.getStartTime() + " – " + booking.getEndTime() + ")";
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .filter(u -> isEnabled(u, "BOOKING_UPDATED"))
                .forEach(admin -> notificationRepository.save(
                        new Notification(admin, message, "BOOKING_UPDATED", null, booking.getId())));
    }

    // ── Preference management ─────────────────────────────────────────────────

    public NotificationPreferenceDTO getPreferences(User user) {
        NotificationPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElse(new NotificationPreference(user.getId()));
        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setDisabledTypes(pref.getDisabledTypes());
        return dto;
    }

    public NotificationPreferenceDTO updatePreferences(User user, NotificationPreferenceDTO dto) {
        NotificationPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElse(new NotificationPreference(user.getId()));
        pref.setDisabledTypes(dto.getDisabledTypes() != null ? dto.getDisabledTypes() : new java.util.HashSet<>());
        preferenceRepository.save(pref);
        NotificationPreferenceDTO result = new NotificationPreferenceDTO();
        result.setDisabledTypes(pref.getDisabledTypes());
        return result;
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<NotificationResponseDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public long countUnread(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    // ── Mark read ─────────────────────────────────────────────────────────────

    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void deleteNotification(Long notificationId, User user) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        notificationRepository.delete(n);
    }

    public void deleteAllForUser(User user) {
        List<Notification> all = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(all);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private NotificationResponseDTO mapToDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .ticketId(n.getTicketId())
                .bookingId(n.getBookingId())
                .build();
    }
}
