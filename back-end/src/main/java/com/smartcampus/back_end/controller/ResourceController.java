package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.dto.ResourceSummaryDTO;
import com.smartcampus.back_end.model.Resource;
import com.smartcampus.back_end.service.ImageStorageService;
import com.smartcampus.back_end.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/resources")  //endpoint for resource management
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ImageStorageService imageStorageService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceSummaryDTO> getResourceSummary() {
        return ResponseEntity.ok(resourceService.getResourceSummary());
    }

    @GetMapping
    public ResponseEntity<Page<Resource>> getAllResources(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Resource> resources;

        if (search != null && !search.isEmpty()) {
            resources = resourceService.searchResources(search, pageable);
        } else if (type != null || status != null) {
            resources = resourceService.filterResources(type, status, pageable);
        } else {
            resources = resourceService.getAllResources(pageable);
        }

        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadResourceImage(@RequestParam("image") MultipartFile image) {
        String relativePath = imageStorageService.storeResourceImage(image);
        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(relativePath)
                .toUriString();
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        try {
            return ResponseEntity.ok(resourceService.updateResource(id, resourceDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(resource -> {
                    boolean isAvailable = "Available".equalsIgnoreCase(resource.getStatus());
                    String reason = isAvailable
                            ? "This resource is currently available and ready for booking."
                            : "This resource is currently unavailable. Status: " + resource.getStatus();
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "available", isAvailable,
                            "status", resource.getStatus(),
                            "reason", reason
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
