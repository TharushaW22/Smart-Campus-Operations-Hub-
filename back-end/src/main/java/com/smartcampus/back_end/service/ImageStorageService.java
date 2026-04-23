package com.smartcampus.back_end.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp",
            "image/gif"
    );

    private final Path resourceUploadsPath;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.resourceUploadsPath = Paths.get(uploadDir, "resources").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.resourceUploadsPath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to initialize upload directory", e);
        }
    }

    public String storeResourceImage(MultipartFile image) {
        validateImage(image);

        String extension = extractExtension(image.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;
        Path target = resourceUploadsPath.resolve(fileName).normalize();

        if (!target.startsWith(resourceUploadsPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }

        try {
            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/resources/" + fileName;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image", e);
        }
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        String contentType = Objects.requireNonNullElse(image.getContentType(), "");
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, WEBP, or GIF images are allowed");
        }

        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 5MB or smaller");
        }
    }

    private String extractExtension(String originalFilename) {
        String cleanedName = StringUtils.cleanPath(Objects.requireNonNullElse(originalFilename, ""));
        int lastDot = cleanedName.lastIndexOf('.');
        if (lastDot == -1 || lastDot == cleanedName.length() - 1) {
            return ".jpg";
        }

        return cleanedName.substring(lastDot).toLowerCase();
    }
}
