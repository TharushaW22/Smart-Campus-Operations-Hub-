package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.dto.NotificationPreferenceDTO;
import com.smartcampus.back_end.dto.NotificationResponseDTO;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.UserRepository;
import com.smartcampus.back_end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications(
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(user)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOne(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        notificationService.deleteNotification(id, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        notificationService.deleteAllForUser(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceDTO> getPreferences(
            @AuthenticationPrincipal String email) {
        User user = getUser(email);
        return ResponseEntity.ok(notificationService.getPreferences(user));
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceDTO> updatePreferences(
            @AuthenticationPrincipal String email,
            @RequestBody NotificationPreferenceDTO dto) {
        User user = getUser(email);
        return ResponseEntity.ok(notificationService.updatePreferences(user, dto));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
