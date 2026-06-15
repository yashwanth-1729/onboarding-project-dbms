package com.onboarding.backend.controller;

import com.onboarding.backend.model.*;
import com.onboarding.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // Detailed step-by-step breakdown for one employee, so the manager can see
    // exactly which steps are DONE vs PENDING (not just an overall percentage).
    @GetMapping("/users/{userId}/steps")
    public ResponseEntity<?> getUserSteps(@PathVariable Long userId) {
        Optional<UserWorkflow> uw = userWorkflowRepository.findByUserId(userId);
        if (uw.isEmpty())
            return ResponseEntity.ok(new ArrayList<>());   // no workflow assigned yet

        List<Step> steps = stepRepository.findByWorkflowId(uw.get().getWorkflowId());

        // Map step_id → progress status for quick lookup
        Map<Long, UserStepProgress> progressByStep = new HashMap<>();
        for (UserStepProgress p : userStepProgressRepository.findByUserId(userId)) {
            progressByStep.put(p.getStepId(), p);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Step step : steps.stream()
                .sorted(Comparator.comparing(Step::getStepOrder,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList()) {
            UserStepProgress p = progressByStep.get(step.getId());
            Map<String, Object> m = new HashMap<>();
            m.put("step_id",      step.getId());
            m.put("title",        step.getTitle());
            m.put("description",  step.getDescription());
            m.put("step_order",   step.getStepOrder());
            m.put("status",       p != null ? p.getStatus() : "PENDING");
            m.put("completed_at", p != null ? p.getCompletedAt() : null);
            result.add(m);
        }

        return ResponseEntity.ok(result);
    }
}