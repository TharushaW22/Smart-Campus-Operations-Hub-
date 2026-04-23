package com.smartcampus.back_end.repository;

import com.smartcampus.back_end.model.IncidentTicket;
import com.smartcampus.back_end.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {
    List<IncidentTicket> findByCreator(User creator);
    List<IncidentTicket> findByCategory(String category);
    List<IncidentTicket> findByStatus(String status);
    List<IncidentTicket> findByAssignedTechnician(User technician);
}
