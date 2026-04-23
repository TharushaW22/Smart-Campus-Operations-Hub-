package com.smartcampus.back_end.controller;

import com.smartcampus.back_end.model.User;
import com.smartcampus.back_end.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("name", user.getName());
        result.put("picture", user.getPicture() != null ? user.getPicture() : "");
        result.put("role", user.getRole().name());
        result.put("phone", user.getPhone() != null ? user.getPhone() : "");
        result.put("address", user.getAddress() != null ? user.getAddress() : "");
        return ResponseEntity.ok(result);
    }
}
