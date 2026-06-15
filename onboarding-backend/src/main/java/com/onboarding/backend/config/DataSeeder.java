package com.onboarding.backend.config;

import com.onboarding.backend.model.User;
import com.onboarding.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Seeds the default accounts on a fresh database (e.g. the managed Postgres on
// Render, where Hibernate creates empty tables). On a local DB already seeded
// via database/schema.sql, the table is non-empty so this does nothing.
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        userRepository.save(makeUser("Admin", "admin@company.com", "admin123", "ADMIN"));
        userRepository.save(makeUser("Yashwanth", "yashwanth@company.com", "yashwanth123", "USER"));
        System.out.println("[seed] inserted default admin + user accounts");
    }

    private User makeUser(String name, String email, String password, String role) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        return u;
    }
}
