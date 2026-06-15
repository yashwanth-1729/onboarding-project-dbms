package com.onboarding.backend.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

// An append-only audit trail stored in MongoDB. Schema-flexible by design:
// any event in the system (login, step completion, assignment, reminder)
// becomes one document here, regardless of which entity it concerns.
@Document(collection = "activity_log")
public class ActivityLog {

    @Id
    private String id;

    private String action;       // LOGIN, STEP_COMPLETED, WORKFLOW_ASSIGNED, REMINDER_SENT
    private String actorEmail;   // who triggered it
    private String detail;       // human-readable description
    private LocalDateTime timestamp;

    public ActivityLog() {}

    public ActivityLog(String action, String actorEmail, String detail) {
        this.action = action;
        this.actorEmail = actorEmail;
        this.detail = detail;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
