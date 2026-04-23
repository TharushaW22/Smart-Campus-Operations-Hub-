package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/avatars/";
    private static final long   MAX_PHOTO_BYTES  = 5 * 1024 * 1024L; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    // ── Validation ────────────────────────────────────────────────────────────

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

    // ── Endpoint ──────────────────────────────────────────────────────────────

    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal String email,
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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

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
            String pictureUrl = savePhoto(photo);
            user.setPicture(pictureUrl);
        }

        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("name", user.getName());
        result.put("picture", user.getPicture() != null ? user.getPicture() : "");
        result.put("role", user.getRole().name());
        result.put("phone", user.getPhone() != null ? user.getPhone() : "");
        result.put("address", user.getAddress() != null ? user.getAddress() : "");

        return ResponseEntity.ok(result);
    }

    private String savePhoto(MultipartFile photo) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = photo.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(filename);
        Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/avatars/" + filename;
    }

    private void deleteOldAvatar(String pictureUrl) {
        if (pictureUrl == null || !pictureUrl.startsWith("/uploads/avatars/")) return;
        try {
            Path old = Paths.get(pictureUrl.substring(1)); // strip leading /
            Files.deleteIfExists(old);
        } catch (IOException ignored) {}
    }
}
