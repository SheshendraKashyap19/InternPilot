package com.internpilot.internpilot.service;

import com.internpilot.internpilot.model.Job;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobMatchingService {

    public Map<String, Object> calculateMatch(
            List<String> resumeSkills,
            Job job) {

        Map<String, Object> result = new LinkedHashMap<>();

        if (resumeSkills == null || resumeSkills.isEmpty()) {
            result.put("matchScore", 0);
            result.put("matchedSkills", new ArrayList<>());
            result.put("missingSkills", new ArrayList<>());
            return result;
        }

        if (job.getSkills() == null || job.getSkills().isBlank()) {
            result.put("matchScore", 0);
            result.put("matchedSkills", new ArrayList<>());
            result.put("missingSkills", new ArrayList<>());
            return result;
        }

        Set<String> resumeSkillSet = new HashSet<>();

        for (String skill : resumeSkills) {
            if (skill != null && !skill.isBlank()) {
                resumeSkillSet.add(skill.trim().toLowerCase());
            }
        }

        String[] jobSkillsArray = job.getSkills().split(",");

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String jobSkill : jobSkillsArray) {

            String cleanJobSkill = jobSkill.trim();

            if (cleanJobSkill.isEmpty()) {
                continue;
            }

            boolean matched = false;

            for (String resumeSkill : resumeSkillSet) {

                if (resumeSkill.contains(cleanJobSkill.toLowerCase())
                        || cleanJobSkill.toLowerCase().contains(resumeSkill)) {

                    matched = true;
                    break;
                }
            }

            if (matched) {
                matchedSkills.add(cleanJobSkill);
            } else {
                missingSkills.add(cleanJobSkill);
            }
        }

        int totalSkills
                = matchedSkills.size() + missingSkills.size();

        int score = 0;

        if (totalSkills > 0) {
            score = (matchedSkills.size() * 100) / totalSkills;
        }

        result.put("jobTitle", job.getTitle());
        result.put("company", job.getCompany());
        result.put("matchScore", score);
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);

        return result;
    }
}
