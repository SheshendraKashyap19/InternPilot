package com.internpilot.internpilot.repository;

import com.internpilot.internpilot.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
