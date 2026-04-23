package com.smartcampus.back_end.repository;

import com.smartcampus.back_end.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    Page<Resource> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location, Pageable pageable);
    Page<Resource> findByTypeAndStatus(String type, String status, Pageable pageable);
    Page<Resource> findByType(String type, Pageable pageable);
    Page<Resource> findByStatus(String status, Pageable pageable);
    Page<Resource> findByStatusAndNameContainingIgnoreCase(String status, String name, Pageable pageable);
    Page<Resource> findByStatusAndType(String status, String type, Pageable pageable);
    Page<Resource> findByStatusAndTypeAndNameContainingIgnoreCase(String status, String type, String name, Pageable pageable);
    long countByStatus(String status);
}
