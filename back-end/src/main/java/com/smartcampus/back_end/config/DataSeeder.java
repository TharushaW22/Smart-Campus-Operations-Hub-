package com.smartcampus.back_end.config;

import com.smartcampus.back_end.model.Role;
import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.model.Resource;
import com.smartcampus.back_end.repository.UserRepository;
import com.smartcampus.back_end.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final AdminProperties adminProperties;

    public DataSeeder(UserRepository userRepository, ResourceRepository resourceRepository, AdminProperties adminProperties) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.adminProperties = adminProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = adminProperties.getEmail();
        if (email == null || email.isBlank()) {
            log.warn("No superadmin email configured (app.admin.email) — skipping seed.");
            return;
        }

        userRepository.findByEmail(email).ifPresentOrElse(
            existing -> {
                if (existing.getRole() != Role.ADMIN) {
                    existing.setRole(Role.ADMIN);
                    userRepository.save(existing);
                    log.info("Promoted existing user {} to ADMIN.", email);
                } else {
                    log.info("Superadmin {} already exists — no action needed.", email);
                }
            },
            () -> {
                User admin = new User(email, adminProperties.getName(), null);
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                log.info("Seeded superadmin: {}", email);
            }
        );

        seedResources();
    }

    private void seedResources() {
        if (resourceRepository.count() == 0) {
            List<Resource> resources = List.of(
                new Resource(null, "Lecture Hall A", "Room", 200, "Block A, Level 2", "Active", null, null, null),
                new Resource(null, "Computer Lab 1", "Lab", 40, "Block B, Level 1", "Active", null, null, null),
                new Resource(null, "Projector X1", "Equipment", null, "Library Media Room", "Active", null, null, null),
                new Resource(null, "Conference Room 2", "Room", 15, "Admin Building", "Out of Service", null, null, null),
                new Resource(null, "Physics Lab", "Lab", 30, "Science Block", "Active", null, null, null),
                new Resource(null, "Drone Alpha", "Equipment", null, "Tech Center", "Active", null, null, null),
                new Resource(null, "Seminar Room C", "Room", 50, "Student Hub", "Active", null, null, null),
                new Resource(null, "Networking Lab", "Lab", 25, "Block B, Level 3", "Out of Service", null, null, null)
            );
            resourceRepository.saveAll(resources);
            log.info("Seeded initial resources.");
        }
    }
}
