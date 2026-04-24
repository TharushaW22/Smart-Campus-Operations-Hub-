package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.dto.*;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.UserRepository;
import com.smartcampus.back_end.service.TicketCommentService;
import com.smartcampus.back_end.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // CRUD part for the tickets 

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> createTicket(
            @ModelAttribute CreateTicketDTO dto,
            @AuthenticationPrincipal String email
    ) throws IOException {
        TicketResponseDTO response = ticketService.createTicket(dto, getUser(email));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ticketService.getMyTickets(getUser(email)));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(getUser(email)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @RequestBody UpdateTicketDTO dto
    ) {
        return ResponseEntity.ok(ticketService.updateTicket(id, dto));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @RequestBody AssignTechnicianDTO dto
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, dto.getTechnicianId()));
    }

    // ── Comments ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDTO> addComment(
            @PathVariable Long id,
            @RequestBody AddCommentDTO dto,
            @AuthenticationPrincipal String email
    ) {
        TicketCommentDTO comment = commentService.addComment(id, dto.getContent(), getUser(email));
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketCommentDTO> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestBody AddCommentDTO dto,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, dto.getContent(), getUser(email)));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal String email
    ) {
        commentService.deleteComment(commentId, getUser(email));
        return ResponseEntity.noContent().build();
    }
}
