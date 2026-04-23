package com.smartcampus.back_end.repository;

import com.smartcampus.back_end.model.Notification;
import com.smartcampus.back_end.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsRead(User user, boolean isRead);
}
