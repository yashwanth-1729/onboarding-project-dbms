package com.onboarding.backend.controller;

import com.onboarding.backend.config.JwtUtil;
import com.onboarding.backend.model.User;
import com.onboarding.backend.repository.UserRepository;
import com.onboarding.backend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ActivityLogService activityLogService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        Optional<User> found = userRepository.findByEmail(email);

        if (found.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials."));
        }

        User user = found.get();

        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        activityLogService.log("LOGIN", user.getEmail(),
                user.getName() + " (" + user.getRole() + ") logged in");

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id",    user.getId());
        userInfo.put("name",  user.getName());
        userInfo.put("email", user.getEmail());
        userInfo.put("role",  user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user",  userInfo);

        return ResponseEntity.ok(response);
    }
}