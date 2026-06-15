package com.onboarding.backend.service;

import com.onboarding.backend.document.ActivityLog;
import com.onboarding.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// Thin helper so controllers can record an audit event in one line.
// Every call writes a new document into the MongoDB activity_log collection.
@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String action, String actorEmail, String detail) {
        activityLogRepository.save(new ActivityLog(action, actorEmail, detail));
    }
}
