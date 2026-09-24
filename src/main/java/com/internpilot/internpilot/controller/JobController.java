package com.internpilot.internpilot.controller;

import com.internpilot.internpilot.model.Job;
import com.internpilot.internpilot.repository.JobRepository;
import com.internpilot.internpilot.service.JobMatchingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobRepository jobRepository;
    private final JobMatchingService jobMatchingService;

    public JobController(
            JobRepository jobRepository,
            JobMatchingService jobMatchingService) {

        this.jobRepository = jobRepository;
        this.jobMatchingService = jobMatchingService;
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }

    @PostMapping("/{jobId}/match")
    public Map<String, Object> matchJob(
            @PathVariable Long jobId,
            @RequestBody List<String> resumeSkills) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        return jobMatchingService.calculateMatch(
                resumeSkills,
                job
        );
    }
}