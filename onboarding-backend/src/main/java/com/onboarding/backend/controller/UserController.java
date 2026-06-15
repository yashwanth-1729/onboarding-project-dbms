package com.onboarding.backend.controller;

import com.onboarding.backend.model.*;
import com.onboarding.backend.repository.*;
import com.onboarding.backend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired private UserRepository              userRepository;
    @Autowired private UserWorkflowRepository      userWorkflowRepository;
    @Autowired private WorkflowRepository          workflowRepository;
    @Autowired private StepRepository              stepRepository;
    @Autowired private UserStepProgressRepository  userStepProgressRepository;
    @Autowired private ActivityLogService          activityLogService;

    @GetMapping("/my-workflow")
    public ResponseEntity<?> getMyWorkflow() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));

        Optional<UserWorkflow> uw = userWorkflowRepository.findByUserId(user.getId());
        if (uw.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "No workflow assigned."));

        Workflow workflow = workflowRepository.findById(uw.get().getWorkflowId()).orElse(null);
        List<Step> steps  = stepRepository.findByWorkflowId(uw.get().getWorkflowId());
        List<UserStepProgress> progress = userStepProgressRepository.findByUserId(user.getId());

        List<Map<String, Object>> progressList = new ArrayList<>();
        for (UserStepProgress p : progress) {
            Map<String, Object> m = new HashMap<>();
            m.put("step_id",      p.getStepId());
            m.put("status",       p.getStatus());
            m.put("completed_at", p.getCompletedAt());
            progressList.add(m);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("workflow", workflow);
        result.put("steps",    steps);
        result.put("progress", progressList);

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/steps/{stepId}/complete")
    public ResponseEntity<?> completeStep(@PathVariable Long stepId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));

        Optional<UserStepProgress> found =
                userStepProgressRepository.findByUserIdAndStepId(user.getId(), stepId);

        if (found.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Step not found."));

        UserStepProgress progress = found.get();
        progress.setStatus("DONE");
        progress.setCompletedAt(LocalDateTime.now());
        userStepProgressRepository.save(progress);

        activityLogService.log("STEP_COMPLETED", user.getEmail(),
                user.getName() + " completed step " + stepId);

        // If all steps done → mark workflow COMPLETED
        List<UserStepProgress> all = userStepProgressRepository.findByUserId(user.getId());
        boolean allDone = all.stream().allMatch(p -> "DONE".equals(p.getStatus()));

        if (allDone) {
            userWorkflowRepository.findByUserId(user.getId()).ifPresent(uw -> {
                uw.setStatus("COMPLETED");
                userWorkflowRepository.save(uw);
            });
        }

        return ResponseEntity.ok(Map.of("message", "Step marked as done."));
    }
}