package com.onboarding.backend.controller;

import com.onboarding.backend.model.*;
import com.onboarding.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    @Autowired private UserRepository              userRepository;
    @Autowired private UserWorkflowRepository      userWorkflowRepository;
    @Autowired private WorkflowRepository          workflowRepository;
    @Autowired private StepRepository              stepRepository;
    @Autowired private UserStepProgressRepository  userStepProgressRepository;
    @Autowired private ReminderRepository          reminderRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsersProgress() {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> "USER".equals(u.getRole()))
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : employees) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",    u.getId());
            m.put("name",  u.getName());
            m.put("email", u.getEmail());

            Optional<UserWorkflow> uw = userWorkflowRepository.findByUserId(u.getId());

            if (uw.isPresent()) {
                m.put("workflow_status", uw.get().getStatus());

                workflowRepository.findById(uw.get().getWorkflowId()).ifPresent(wf ->
                    m.put("workflow_title", wf.getTitle())
                );

                int totalSteps = stepRepository
                        .findByWorkflowId(uw.get().getWorkflowId()).size();

                long doneSteps = userStepProgressRepository
                        .findByUserId(u.getId()).stream()
                        .filter(p -> "DONE".equals(p.getStatus()))
                        .count();

                m.put("total_steps", totalSteps);
                m.put("done_steps",  doneSteps);
            } else {
                m.put("workflow_status", null);
                m.put("workflow_title",  null);
                m.put("total_steps",     0);
                m.put("done_steps",      0);
            }

            result.add(m);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/reminders")
    public ResponseEntity<?> sendReminder(@RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByEmail(email).orElse(null);

        if (manager == null)
            return ResponseEntity.status(404).body(Map.of("message", "Manager not found."));

        Long userId    = Long.valueOf(body.get("user_id").toString());
        String message = (String) body.get("message");

        Reminder reminder = new Reminder();
        reminder.setManagerId(manager.getId());
        reminder.setUserId(userId);
        reminder.setMessage(message);
        reminderRepository.save(reminder);

        return ResponseEntity.ok(Map.of("message", "Reminder sent."));
    }
}