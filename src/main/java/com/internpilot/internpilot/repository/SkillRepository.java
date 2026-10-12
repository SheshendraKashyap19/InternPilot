package com.internpilot.internpilot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.internpilot.internpilot.model.Skill;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByStudentId(Long studentId);
}
