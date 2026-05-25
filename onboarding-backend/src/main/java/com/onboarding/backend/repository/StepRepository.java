package com.onboarding.backend.repository;

import com.onboarding.backend.model.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StepRepository extends JpaRepository<Step, Long> {
    List<Step> findByWorkflowId(Long workflowId);
}