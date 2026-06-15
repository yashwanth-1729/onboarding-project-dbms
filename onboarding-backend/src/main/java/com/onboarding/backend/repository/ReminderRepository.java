package com.onboarding.backend.repository;

import com.onboarding.backend.document.Reminder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// MongoRepository → Spring Data routes this to MongoDB (id type is String).
public interface ReminderRepository extends MongoRepository<Reminder, String> {
    List<Reminder> findByUserId(Long userId);
}
