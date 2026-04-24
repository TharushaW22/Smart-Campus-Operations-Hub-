package com.smartcampus.back_end.service;

import com.smartcampus.back_end.dto.TicketCommentDTO;
import com.smartcampus.back_end.model.IncidentTicket;
import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.model.TicketComment;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.IncidentTicketRepository;
import com.smartcampus.back_end.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketRepository ticketRepository;
    private final NotificationService notificationService;

    public List<TicketCommentDTO> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketCommentDTO addComment(Long ticketId, String content, User author) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(content);

        TicketComment saved = commentRepository.save(comment);
        notificationService.notifyCommentAdded(ticket, author);
        return mapToDTO(saved);
    }

    public TicketCommentDTO updateComment(Long commentId, String newContent, User requester) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
        }

        comment.setContent(newContent);
        return mapToDTO(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, User requester) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        boolean isOwner = comment.getAuthor().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private TicketCommentDTO mapToDTO(TicketComment comment) {
        return TicketCommentDTO.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getName())
                .authorPicture(comment.getAuthor().getPicture())
                .authorRole(comment.getAuthor().getRole().name())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
