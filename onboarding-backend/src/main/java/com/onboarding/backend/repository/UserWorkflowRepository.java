package com.onboarding.backend.repository;

import com.onboarding.backend.model.UserWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserWorkflowRepository extends JpaRepository<UserWorkflow, Long> {
    Optional<UserWorkflow> findByUserId(Long userId);
    List<UserWorkflow> findByWorkflowId(Long workflowId);
}