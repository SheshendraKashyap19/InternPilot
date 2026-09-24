package com.internpilot.internpilot.repository;

import com.internpilot.internpilot.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}