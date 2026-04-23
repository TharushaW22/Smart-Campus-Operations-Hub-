package com.smartcampus.back_end.service;

import com.smartcampus.back_end.dto.*;
import com.smartcampus.back_end.model.IncidentTicket;
import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.IncidentTicketRepository;
import com.smartcampus.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketResponseDTO createTicket(CreateTicketDTO dto, User user) throws IOException {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceLocation(dto.getResourceLocation());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setPreferredContactDetails(dto.getPreferredContactDetails());
        ticket.setCreator(user);

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            List<String> base64Images = new ArrayList<>();
            int limit = Math.min(dto.getImages().size(), 3);
            for (int i = 0; i < limit; i++) {
                MultipartFile image = dto.getImages().get(i);
                if (image != null && !image.isEmpty()) {
                    base64Images.add("data:" + image.getContentType() + ";base64," + convertToBase64(image));
                }
            }
            ticket.setImages(base64Images);
        }

        IncidentTicket savedTicket = ticketRepository.save(ticket);
        notificationService.notifyAdminsNewTicket(savedTicket);
        return mapToDTO(savedTicket);
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getMyTickets(User user) {
        return ticketRepository.findByCreator(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getAssignedTickets(User technician) {
        return ticketRepository.findByAssignedTechnician(technician).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(Long id) {
        return mapToDTO(ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")));
    }

    public TicketResponseDTO updateTicket(Long id, UpdateTicketDTO dto) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (dto.getStatus() != null) {
            String oldStatus = ticket.getStatus();
            ticket.setStatus(dto.getStatus());
            if (!dto.getStatus().equals(oldStatus)) {
                notificationService.notifyCreatorStatusChanged(ticket, dto.getStatus());
            }
        }
        if (dto.getResolutionNote() != null) {
            ticket.setResolutionNote(dto.getResolutionNote());
        }
        if (dto.getRejectionReason() != null) {
            ticket.setRejectionReason(dto.getRejectionReason());
        }

        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponseDTO assignTechnician(Long ticketId, Long technicianId) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User does not have a technician role");
        }

        ticket.setAssignedTechnician(technician);
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            notificationService.notifyCreatorStatusChanged(ticket, "IN_PROGRESS");
        }

        IncidentTicket saved = ticketRepository.save(ticket);
        notificationService.notifyTechnicianAssigned(saved, technician);
        return mapToDTO(saved);
    }

    public TicketResponseDTO mapToDTO(IncidentTicket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .resourceLocation(ticket.getResourceLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .preferredContactDetails(ticket.getPreferredContactDetails())
                .images(ticket.getImages())
                .creatorId(ticket.getCreator().getId())
                .creatorName(ticket.getCreator().getName())
                .assignedTechnicianId(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : null)
                .assignedTechnicianName(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getName() : null)
                .status(ticket.getStatus())
                .resolutionNote(ticket.getResolutionNote())
                .rejectionReason(ticket.getRejectionReason())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private String convertToBase64(MultipartFile file) throws IOException {
        return Base64.getEncoder().encodeToString(file.getBytes());
    }
}
