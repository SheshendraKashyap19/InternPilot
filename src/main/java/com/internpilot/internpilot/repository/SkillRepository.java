package com.internpilot.internpilot.repository;

import com.internpilot.internpilot.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
