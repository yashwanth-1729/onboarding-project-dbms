package com.onboarding.backend.repository;

import com.onboarding.backend.model.UserStepProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserStepProgressRepository extends JpaRepository<UserStepProgress, Long> {
    List<UserStepProgress> findByUserId(Long userId);
    List<UserStepProgress> findByStepId(Long stepId);
    Optional<UserStepProgress> findByUserIdAndStepId(Long userId, Long stepId);
}