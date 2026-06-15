package com.onboarding.backend.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

// Stored in MongoDB (not PostgreSQL). A reminder is a self-contained
// document — no joins needed — so it's a natural fit for a NoSQL collection.
@Document(collection = "reminders")
public class Reminder {

    @Id
    private String id;

    private Long managerId;
    private Long userId;
    private String message;
    private LocalDateTime sentAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
