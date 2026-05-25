package com.onboarding.backend.controller;

import com.onboarding.backend.model.*;
import com.onboarding.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired private UserRepository              userRepository;
    @Autowired private WorkflowRepository          workflowRepository;
    @Autowired private StepRepository              stepRepository;
    @Autowired private UserWorkflowRepository      userWorkflowRepository;
    @Autowired private UserStepProgressRepository  userStepProgressRepository;

    // ── USERS ────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",    u.getId());
            m.put("name",  u.getName());
            m.put("email", u.getEmail());
            m.put("role",  u.getRole());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        if (userRepository.findByEmail(body.get("email")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists."));
        }
        User user = new User();
        user.setName(body.get("name"));
        user.setEmail(body.get("email"));
        user.setPassword(body.get("password"));
        user.setRole(body.get("role"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User created successfully."));
    }

    // ── WORKFLOWS ────────────────────────────────────────────

    @GetMapping("/workflows")
    public ResponseEntity<?> getAllWorkflows() {
        return ResponseEntity.ok(workflowRepository.findAll());
    }

    @PostMapping("/workflows")
    public ResponseEntity<?> createWorkflow(@RequestBody Map<String, String> body) {
        Workflow wf = new Workflow();
        wf.setTitle(body.get("title"));
        wf.setJobType(body.get("job_type"));
        wf.setDescription(body.get("description"));
        workflowRepository.save(wf);
        return ResponseEntity.ok(wf);
    }

    @GetMapping("/workflows/{id}/steps")
    public ResponseEntity<?> getSteps(@PathVariable Long id) {
        return ResponseEntity.ok(stepRepository.findByWorkflowId(id));
    }

    @PostMapping("/workflows/{id}/steps")
    public ResponseEntity<?> addStep(@PathVariable Long id,
                                     @RequestBody Map<String, Object> body) {
        Step step = new Step();
        step.setWorkflowId(id);
        step.setTitle((String) body.get("title"));
        step.setDescription((String) body.get("description"));
        step.setStepOrder((Integer) body.get("step_order"));
        stepRepository.save(step);
        return ResponseEntity.ok(step);
    }

    // ── ASSIGN ───────────────────────────────────────────────

    @PostMapping("/assign")
    public ResponseEntity<?> assignWorkflow(@RequestBody Map<String, Object> body) {
        Long userId     = Long.valueOf(body.get("user_id").toString());
        Long workflowId = Long.valueOf(body.get("workflow_id").toString());

        if (userWorkflowRepository.findByUserId(userId).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User already has a workflow assigned."));
        }

        // 1. Create assignment
        UserWorkflow uw = new UserWorkflow();
        uw.setUserId(userId);
        uw.setWorkflowId(workflowId);
        userWorkflowRepository.save(uw);

        // 2. Get all steps of this workflow
        List<Step> steps = stepRepository.findByWorkflowId(workflowId);

        // 3. Create PENDING progress entry for each step
        for (Step step : steps) {
            UserStepProgress progress = new UserStepProgress();
            progress.setUserId(userId);
            progress.setStepId(step.getId());
            progress.setStatus("PENDING");
            userStepProgressRepository.save(progress);
        }

        return ResponseEntity.ok(Map.of("message", "Workflow assigned successfully."));
    }
}