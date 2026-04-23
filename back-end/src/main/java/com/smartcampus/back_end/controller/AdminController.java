package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private static final String UPLOAD_DIR = "uploads/avatars/";
    private static final long MAX_PHOTO_BYTES = 5 * 1024 * 1024L;
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
    }

    private ResponseEntity<Map<String, Object>> validatePhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) return null;
        if (!ALLOWED_TYPES.contains(photo.getContentType()))
            return badRequest("Invalid file type. Only JPG, PNG, GIF, or WebP images are allowed.");
        if (photo.getSize() > MAX_PHOTO_BYTES)
            return badRequest(String.format(
                    "Photo is too large (%.1f MB). Maximum allowed size is 5 MB.",
                    photo.getSize() / 1024.0 / 1024.0));
        return null;
    }

    private ResponseEntity<Map<String, Object>> validateFields(String name, String phone, String address) {
        if (name != null && !name.isBlank()) {
            String n = name.trim();
            if (n.length() < 2)  return badRequest("Name must be at least 2 characters.");
            if (n.length() > 80) return badRequest("Name cannot exceed 80 characters.");
            if (n.matches("\\d+")) return badRequest("Name cannot be numbers only.");
        }
        if (phone != null && !phone.isBlank()) {
            String clean = phone.trim().replaceAll("[\\s\\-(). ]", "");
            if (!clean.matches("^\\+?\\d{7,15}$"))
                return badRequest("Enter a valid phone number (7–15 digits, optional + prefix).");
        }
        if (address != null && address.trim().length() > 200)
            return badRequest("Address cannot exceed 200 characters.");
        return null;
    }

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("name", u.getName());
        m.put("picture", u.getPicture() != null ? u.getPicture() : "");
        m.put("role", u.getRole().name());
        m.put("phone", u.getPhone() != null ? u.getPhone() : "");
        m.put("address", u.getAddress() != null ? u.getAddress() : "");
        return m;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserMap)
                .toList();
    }

    @PatchMapping(value = "/users/{id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> editUserProfile(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) MultipartFile photo,
            @RequestParam(required = false, defaultValue = "false") boolean removePhoto
    ) throws IOException {

        ResponseEntity<Map<String, Object>> fieldError = validateFields(name, phone, address);
        if (fieldError != null) return fieldError;

        ResponseEntity<Map<String, Object>> photoError = validatePhoto(photo);
        if (photoError != null) return photoError;

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        user.setPhone((phone != null && !phone.isBlank()) ? phone.trim() : null);
        user.setAddress((address != null && !address.isBlank()) ? address.trim() : null);

        if (removePhoto) {
            deleteOldAvatar(user.getPicture());
            user.setPicture(null);
        } else if (photo != null && !photo.isEmpty()) {
            deleteOldAvatar(user.getPicture());
            user.setPicture(savePhoto(photo));
        }

        userRepository.save(user);
        return ResponseEntity.ok(toUserMap(user));
    }

    private String savePhoto(MultipartFile photo) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String original = photo.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID() + ext;
        Files.copy(photo.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/avatars/" + filename;
    }

    private void deleteOldAvatar(String pictureUrl) {
        if (pictureUrl == null || !pictureUrl.startsWith("/uploads/avatars/")) return;
        try { Files.deleteIfExists(Paths.get(pictureUrl.substring(1))); } catch (IOException ignored) {}
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> assignRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String adminEmail) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        // Prevent admin from demoting themselves
        if (user.getEmail().equals(adminEmail)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "You cannot change your own role."));
        }

        Role newRole;
        try {
            newRole = Role.valueOf(body.get("role").toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Valid values: USER, ADMIN, TECHNICIAN"));
        }

        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal String adminEmail) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        // Prevent admin from deleting themselves
        if (user.getEmail().equals(adminEmail)) {
            return ResponseEntity.badRequest().build();
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
