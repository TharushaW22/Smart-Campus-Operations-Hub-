package com.smartcampus.back_end.service;

import com.smartcampus.back_end.dto.ResourceSummaryDTO;
import com.smartcampus.back_end.exception.ResourceInUseException;
import com.smartcampus.back_end.exception.ResourceNotFoundException;
import com.smartcampus.back_end.model.Resource;
import com.smartcampus.back_end.repository.BookingRepository;
import com.smartcampus.back_end.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public ResourceSummaryDTO getResourceSummary() {
        long total = resourceRepository.count();
        long active = resourceRepository.countByStatus("Active");
        long outOfService = resourceRepository.countByStatus("Out of Service");
        return new ResourceSummaryDTO(total, active, outOfService);
    }

    public Page<Resource> getAllResources(Pageable pageable) {
        return resourceRepository.findAll(pageable);
    }

    public Page<Resource> searchResources(String query, Pageable pageable) {
        return resourceRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(query, query, pageable);
    }

    public Page<Resource> filterResources(String type, String status, Pageable pageable) {
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(type, status, pageable);
        } else if (type != null) {
            return resourceRepository.findByType(type, pageable);
        } else if (status != null) {
            return resourceRepository.findByStatus(status, pageable);
        } else {
            return resourceRepository.findAll(pageable);
        }
    }

    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setStatus(resourceDetails.getStatus());
        resource.setDescription(resourceDetails.getDescription());
        resource.setImageUrl(resourceDetails.getImageUrl());
        resource.setAmenities(resourceDetails.getAmenities());
        
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Resource id is required");
        }

        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found: " + id);
        }

        if (bookingRepository.existsByResourceId(id)) {
            throw new ResourceInUseException("Cannot delete resource while it has bookings");
        }

        resourceRepository.deleteById(id);
    }

    public Page<Resource> getActiveResources(String search, String type, Pageable pageable) {
        String status = "Active";
        if (type != null && search != null) {
            return resourceRepository.findByStatusAndTypeAndNameContainingIgnoreCase(status, type, search, pageable);
        } else if (type != null) {
            return resourceRepository.findByStatusAndType(status, type, pageable);
        } else if (search != null) {
            return resourceRepository.findByStatusAndNameContainingIgnoreCase(status, search, pageable);
        } else {
            return resourceRepository.findByStatus(status, pageable);
        }
    }
}
