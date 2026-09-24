package com.internpilot.internpilot.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class ResumeParserService {

    // =============================================================
    // MAIN PARSER
    // =============================================================
    public Map<String, Object> parseResume(String text) {

        Map<String, Object> profile
                = new LinkedHashMap<>();

        String cleanedText
                = cleanText(text);

        // =========================================================
        // BASIC INFORMATION
        // =========================================================
        String name
                = extractName(cleanedText);

        String email
                = extractEmail(cleanedText);

        String phone
                = extractPhone(cleanedText);

        String location
                = extractLocation(cleanedText);

        // =========================================================
        // RESUME SECTIONS
        // =========================================================
        String summary
                = extractSection(
                        cleanedText,
                        "PROFESSIONAL SUMMARY",
                        "TECHNICAL SKILLS"
                );

        String experience
                = extractSection(
                        cleanedText,
                        "INTERNSHIP EXPERIENCE",
                        "ENGINEERING PROJECTS"
                );

        String projects
                = extractSection(
                        cleanedText,
                        "ENGINEERING PROJECTS",
                        "EDUCATION"
                );

        String education
                = extractSection(
                        cleanedText,
                        "EDUCATION",
                        "ACHIEVEMENTS & CONTINUOUS LEARNING"
                );

        String achievements
                = extractSection(
                        cleanedText,
                        "ACHIEVEMENTS & CONTINUOUS LEARNING",
                        "CERTIFICATIONS"
                );

        String certifications
                = extractSection(
                        cleanedText,
                        "CERTIFICATIONS",
                        null
                );

        // =========================================================
        // SKILLS
        // =========================================================
        List<String> skills
                = extractSkills(cleanedText);

        // =========================================================
        // FLAT PROFILE
        // =========================================================
        profile.put(
                "name",
                name
        );

        profile.put(
                "email",
                email
        );

        profile.put(
                "phone",
                phone
        );

        profile.put(
                "location",
                location
        );

        profile.put(
                "skills",
                skills
        );

        profile.put(
                "summary",
                summary
        );

        profile.put(
                "experience",
                experience
        );

        profile.put(
                "projects",
                projects
        );

        profile.put(
                "education",
                education
        );

        profile.put(
                "achievements",
                achievements
        );

        profile.put(
                "certifications",
                certifications
        );

        // =========================================================
        // STRUCTURED STUDENT PROFILE
        // =========================================================
        Map<String, Object> student
                = new LinkedHashMap<>();

        student.put(
                "name",
                name
        );

        student.put(
                "email",
                email
        );

        student.put(
                "phone",
                phone
        );

        student.put(
                "location",
                location
        );

        student.put(
                "linkedin",
                extractLinkedIn(cleanedText)
        );

        student.put(
                "github",
                extractGitHub(cleanedText)
        );

        // =========================================================
        // EDUCATION
        // =========================================================
        Map<String, Object> educationProfile
                = new LinkedHashMap<>();

        educationProfile.put(
                "university",
                extractUniversity(education)
        );

        educationProfile.put(
                "city",
                extractEducationCity(education)
        );

        educationProfile.put(
                "degree",
                extractDegree(education)
        );

        educationProfile.put(
                "branch",
                extractBranch(education)
        );

        educationProfile.put(
                "cgpa",
                extractCGPA(education)
        );

        educationProfile.put(
                "graduationYear",
                extractGraduationYear(education)
        );

        student.put(
                "education",
                educationProfile
        );

        // =========================================================
        // SKILLS
        // =========================================================
        student.put(
                "skills",
                skills
        );

        // =========================================================
        // KEYWORDS
        // =========================================================
        student.put(
                "keywords",
                extractKeywords(cleanedText)
        );

        // =========================================================
        // PROJECTS
        // =========================================================
        student.put(
                "projects",
                extractProjects(projects)
        );

        // =========================================================
        // INTERNSHIPS
        // =========================================================
        student.put(
                "internships",
                extractInternships(experience)
        );

        // =========================================================
        // ACHIEVEMENTS
        // =========================================================
        student.put(
                "achievements",
                extractAchievements(achievements)
        );

        // =========================================================
        // CERTIFICATIONS
        // =========================================================
        student.put(
                "certifications",
                extractCertifications(certifications)
        );

        // =========================================================
        // FINAL STUDENT OBJECT
        // =========================================================
        profile.put(
                "student",
                student
        );

        return profile;
    }

    // =============================================================
    // CLEAN TEXT
    // =============================================================
    private String cleanText(String text) {

        if (text == null) {
            return "";
        }

        return text
                .replace("\u200B", "")
                .replace("\u200C", "")
                .replace("\u200D", "")
                .replace("\uFEFF", "")
                .replace("\r", "")
                .replaceAll("[ \t]+", " ")
                .replaceAll("\n{3,}", "\n\n")
                .trim();
    }

    // =============================================================
    // NAME
    // =============================================================
    private String extractName(String text) {

        String[] lines
                = text.split("\n");

        for (String line : lines) {

            String cleanedLine
                    = line.trim();

            if (!cleanedLine.isEmpty()
                    && !cleanedLine.contains("@")
                    && !cleanedLine.matches(".*\\d{10}.*")
                    && cleanedLine.length() < 80) {

                return cleanedLine;
            }
        }

        return "";
    }

    // =============================================================
    // EMAIL
    // =============================================================
    private String extractEmail(String text) {

        Pattern pattern
                = Pattern.compile(
                        "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
                );

        Matcher matcher
                = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group();
        }

        return "";
    }

    // =============================================================
    // PHONE
    // =============================================================
    private String extractPhone(String text) {

        Pattern pattern
                = Pattern.compile(
                        "(?:\\+91[-\\s]?)?[6-9]\\d{9}"
                );

        Matcher matcher
                = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group();
        }

        return "";
    }

    // =============================================================
    // LOCATION
    // =============================================================
    private String extractLocation(String text) {

        Pattern pattern
                = Pattern.compile(
                        "(Hyderabad|Bangalore|Bengaluru|Mumbai|Delhi|Chennai|Pune|Kolkata|India)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group();
        }

        return "";
    }

    // =============================================================
    // LINKEDIN
    // =============================================================
    private String extractLinkedIn(String text) {

        Pattern pattern
                = Pattern.compile(
                        "(https?://)?(www\\.)?linkedin\\.com/in/[A-Za-z0-9_\\-./]+",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(text);

        if (matcher.find()) {

            String url
                    = matcher.group();

            if (!url.startsWith("http")) {
                url = "https://" + url;
            }

            return url;
        }

        return "";
    }

    // =============================================================
    // GITHUB
    // =============================================================
    private String extractGitHub(String text) {

        Pattern pattern
                = Pattern.compile(
                        "(https?://)?(www\\.)?github\\.com/[A-Za-z0-9_\\-./]+",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(text);

        if (matcher.find()) {

            String url
                    = matcher.group();

            if (!url.startsWith("http")) {
                url = "https://" + url;
            }

            return url;
        }

        return "";
    }

    // =============================================================
    // SKILLS
    // =============================================================
    private List<String> extractSkills(String text) {

        List<String> skills
                = new ArrayList<>();

        String skillsSection
                = extractSection(
                        text,
                        "TECHNICAL SKILLS",
                        "INTERNSHIP EXPERIENCE"
                );

        if (skillsSection.isBlank()) {
            return skills;
        }

        String[] lines
                = skillsSection.split("\n");

        for (String line : lines) {

            String cleanedLine
                    = line.trim();

            if (cleanedLine.isEmpty()) {
                continue;
            }

            String[] parts
                    = cleanedLine.split(":", 2);

            if (parts.length < 2) {
                continue;
            }

            String skillValues
                    = parts[1];

            /*
             * Fix common PDF extraction issues.
             */
            skillValues
                    = skillValues
                            .replaceAll(
                                    "(?i)API(?=[A-Z])",
                                    "API "
                            );

            skillValues
                    = skillValues
                            .replaceAll(
                                    "\\s*\\(branching\\s*,\\s*PRs\\s*,\\s*code reviews\\)",
                                    ""
                            );

            String[] individualSkills
                    = skillValues.split("[,·|]");

            for (String skill
                    : individualSkills) {

                String cleanSkill
                        = skill.trim();

                if (cleanSkill.isEmpty()) {
                    continue;
                }

                cleanSkill
                        = cleanSkill.replaceAll(
                                "\\s+",
                                " "
                        );

                cleanSkill
                        = normalizeSkill(
                                cleanSkill
                        );

                if (!skills.contains(cleanSkill)) {
                    skills.add(cleanSkill);
                }
            }
        }

        return skills;
    }

    // =============================================================
    // NORMALIZE SKILL
    // =============================================================
    private String normalizeSkill(String skill) {

        String lower
                = skill.toLowerCase();

        switch (lower) {

            case "java (primary)":
                return "Java";

            case "rest apidesign":
            case "rest api design":
            case "rest api":
                return "REST API";

            case "mvc architecture":
            case "mvc":
                return "MVC";

            case "postman (api testing/debugging)":
            case "postman":
                return "Postman";

            case "git/github":
            case "git/github (branching":
                return "Git/GitHub";

            case "html5":
                return "HTML5";

            case "css3":
                return "CSS3";

            case "react.js (familiar)":
            case "react.js":
                return "React.js";

            default:
                return skill;
        }
    }

    // =============================================================
    // KEYWORDS
    // =============================================================
    private List<String> extractKeywords(String text) {

        List<String> keywords
                = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return keywords;
        }

        String lowerText
                = text.toLowerCase();

        String[] keywordPatterns = {
            "software engineering",
            "backend development",
            "frontend development",
            "web development",
            "full stack",
            "object oriented programming",
            "data structures",
            "algorithms",
            "complexity analysis",
            "dynamic programming",
            "binary trees",
            "java",
            "python",
            "c++",
            "c",
            "spring boot",
            "rest api",
            "restful",
            "mvc",
            "microservices",
            "sql",
            "database",
            "mysql",
            "git",
            "github",
            "postman",
            "intellij idea",
            "vs code",
            "linux",
            "agile",
            "scrum",
            "feature branching",
            "pull requests",
            "code reviews",
            "clean code",
            "single responsibility",
            "html",
            "html5",
            "css",
            "css3",
            "javascript",
            "react.js",
            "machine learning",
            "deep learning",
            "artificial intelligence",
            "nlp",
            "natural language processing",
            "scikit-learn",
            "numpy",
            "pandas",
            "nltk",
            "tf-idf",
            "logistic regression",
            "naive bayes",
            "research",
            "neural signal",
            "eeg",
            "speech recognition",
            "api testing",
            "debugging",
            "automated testing",
            "internship",
            "b.tech",
            "computer science engineering"
        };

        for (String keyword
                : keywordPatterns) {

            if (lowerText.contains(
                    keyword.toLowerCase())) {

                String formatted
                        = formatKeyword(keyword);

                if (!keywords.contains(formatted)) {
                    keywords.add(formatted);
                }
            }
        }

        return keywords;
    }

    // =============================================================
    // FORMAT KEYWORDS
    // =============================================================
    private String formatKeyword(String keyword) {

        switch (keyword.toLowerCase()) {

            case "java":
                return "Java";

            case "python":
                return "Python";

            case "c++":
                return "C++";

            case "c":
                return "C";

            case "spring boot":
                return "Spring Boot";

            case "rest api":
                return "REST API";

            case "restful":
                return "RESTful";

            case "mvc":
                return "MVC";

            case "sql":
                return "SQL";

            case "mysql":
                return "MySQL";

            case "git":
                return "Git";

            case "github":
                return "GitHub";

            case "postman":
                return "Postman";

            case "javascript":
                return "JavaScript";

            case "react.js":
                return "React.js";

            case "html":
                return "HTML";

            case "html5":
                return "HTML5";

            case "css":
                return "CSS";

            case "css3":
                return "CSS3";

            case "machine learning":
                return "Machine Learning";

            case "deep learning":
                return "Deep Learning";

            case "artificial intelligence":
                return "Artificial Intelligence";

            case "nlp":
                return "NLP";

            case "natural language processing":
                return "Natural Language Processing";

            case "scikit-learn":
                return "scikit-learn";

            case "numpy":
                return "NumPy";

            case "pandas":
                return "pandas";

            case "nltk":
                return "NLTK";

            case "tf-idf":
                return "TF-IDF";

            case "logistic regression":
                return "Logistic Regression";

            case "naive bayes":
                return "Naive Bayes";

            case "agile":
                return "Agile";

            case "scrum":
                return "Scrum";

            case "data structures":
                return "Data Structures";

            case "algorithms":
                return "Algorithms";

            case "dynamic programming":
                return "Dynamic Programming";

            case "microservices":
                return "Microservices";

            case "backend development":
                return "Backend Development";

            case "frontend development":
                return "Frontend Development";

            case "web development":
                return "Web Development";

            case "software engineering":
                return "Software Engineering";

            case "object oriented programming":
                return "Object-Oriented Programming";

            case "complexity analysis":
                return "Complexity Analysis";

            case "code reviews":
                return "Code Reviews";

            case "pull requests":
                return "Pull Requests";

            case "feature branching":
                return "Feature Branching";

            case "clean code":
                return "Clean Code";

            case "single responsibility":
                return "Single Responsibility";

            case "api testing":
                return "API Testing";

            case "debugging":
                return "Debugging";

            case "automated testing":
                return "Automated Testing";

            case "research":
                return "Research";

            case "neural signal":
                return "Neural Signal";

            case "eeg":
                return "EEG";

            case "speech recognition":
                return "Speech Recognition";

            case "linux":
                return "Linux";

            case "internship":
                return "Internship";

            case "b.tech":
                return "B.Tech";

            case "computer science engineering":
                return "Computer Science Engineering";

            default:
                return keyword;
        }
    }

    // =============================================================
    // PROJECTS
    // =============================================================
    private List<Map<String, Object>> extractProjects(
            String projectsText) {

        List<Map<String, Object>> projects
                = new ArrayList<>();

        if (projectsText == null
                || projectsText.isBlank()) {

            return projects;
        }

        String[] lines
                = projectsText.split("\n");

        Map<String, Object> currentProject
                = null;

        List<String> details
                = null;

        for (String line
                : lines) {

            String cleanedLine
                    = line.trim();

            if (cleanedLine.isEmpty()) {
                continue;
            }

            if (isProjectHeading(cleanedLine)) {

                if (currentProject != null) {

                    currentProject.put(
                            "details",
                            details
                    );

                    projects.add(
                            currentProject
                    );
                }

                currentProject
                        = new LinkedHashMap<>();

                details
                        = new ArrayList<>();

                currentProject.put(
                        "name",
                        extractProjectName(
                                cleanedLine
                        )
                );

                currentProject.put(
                        "technologies",
                        extractProjectTechnologies(
                                cleanedLine
                        )
                );

                continue;
            }

            if (currentProject != null) {

                String detail
                        = cleanedLine.replaceFirst(
                                "^[•●▪◦\\-]\\s*",
                                ""
                        ).trim();

                if (!detail.isEmpty()) {
                    details.add(detail);
                }
            }
        }

        if (currentProject != null) {

            currentProject.put(
                    "details",
                    details
            );

            projects.add(
                    currentProject
            );
        }

        return projects;
    }

    // =============================================================
    // PROJECT HEADING
    // =============================================================
    private boolean isProjectHeading(
            String line) {

        String lower
                = line.toLowerCase();

        return lower.startsWith(
                "task management rest api"
        )
                || lower.startsWith(
                        "news classification service"
                )
                || lower.startsWith(
                        "real-time sentiment analysis service"
                )
                || lower.startsWith(
                        "movie recommendation engine"
                );
    }

    // =============================================================
    // PROJECT NAME
    // =============================================================
    private String extractProjectName(
            String line) {

        String[] knownProjects = {
            "Task Management REST API",
            "News Classification Service",
            "Real-Time Sentiment Analysis Service",
            "Movie Recommendation Engine"
        };

        for (String project
                : knownProjects) {

            if (line.toLowerCase()
                    .startsWith(
                            project.toLowerCase()
                    )) {

                return project;
            }
        }

        return line;
    }

    // =============================================================
    // PROJECT TECHNOLOGIES
    // =============================================================
    private List<String> extractProjectTechnologies(
            String line) {

        List<String> technologies
                = new ArrayList<>();

        String projectName
                = extractProjectName(line);

        String technologyPart
                = line.substring(
                        projectName.length()
                ).trim();

        technologyPart
                = technologyPart.replaceFirst(
                        "^[|:·\\-]+",
                        ""
                ).trim();

        if (technologyPart.isEmpty()) {
            return technologies;
        }

        String[] techArray
                = technologyPart.split(
                        "\\s*[·|]\\s*"
                );

        for (String technology
                : techArray) {

            String cleanTechnology
                    = technology.trim();

            if (!cleanTechnology.isEmpty()) {
                technologies.add(
                        cleanTechnology
                );
            }
        }

        return technologies;
    }

    // =============================================================
    // INTERNSHIPS
    // =============================================================
    private List<Map<String, Object>> extractInternships(
            String experienceText) {

        List<Map<String, Object>> internships
                = new ArrayList<>();

        if (experienceText == null
                || experienceText.isBlank()) {

            return internships;
        }

        String[] lines
                = experienceText.split("\n");

        Map<String, Object> currentInternship
                = null;

        List<String> details
                = null;

        boolean expectingCompany
                = false;

        for (String line
                : lines) {

            String cleanedLine
                    = line.trim();

            if (cleanedLine.isEmpty()) {
                continue;
            }

            // -----------------------------------------------------
            // Detect internship role
            // -----------------------------------------------------
            if (isInternshipHeading(
                    cleanedLine)) {

                // Save previous internship
                if (currentInternship != null) {

                    currentInternship.put(
                            "details",
                            details
                    );

                    internships.add(
                            currentInternship
                    );
                }

                currentInternship
                        = new LinkedHashMap<>();

                details
                        = new ArrayList<>();

                currentInternship.put(
                        "role",
                        extractInternshipRole(
                                cleanedLine
                        )
                );

                currentInternship.put(
                        "duration",
                        extractInternshipDuration(
                                cleanedLine
                        )
                );

                currentInternship.put(
                        "type",
                        extractInternshipType(
                                cleanedLine
                        )
                );

                expectingCompany
                        = true;

                continue;
            }

            // -----------------------------------------------------
            // Company
            // -----------------------------------------------------
            if (currentInternship != null
                    && expectingCompany) {

                currentInternship.put(
                        "company",
                        cleanedLine
                );

                expectingCompany
                        = false;

                continue;
            }

            // -----------------------------------------------------
            // Internship detail
            // -----------------------------------------------------
            if (currentInternship != null) {

                String detail
                        = cleanedLine.replaceFirst(
                                "^[•●▪◦\\-]\\s*",
                                ""
                        ).trim();

                if (!detail.isEmpty()) {

                    details.add(
                            detail
                    );
                }
            }
        }

        // ---------------------------------------------------------
        // Save final internship
        // ---------------------------------------------------------
        if (currentInternship != null) {

            currentInternship.put(
                    "details",
                    details
            );

            internships.add(
                    currentInternship
            );
        }

        return internships;
    }

    // =============================================================
    // INTERNSHIP HEADING
    // =============================================================
    private boolean isInternshipHeading(
            String line) {

        String lower
                = line.toLowerCase();

        return lower.contains("intern")
                && (lower.contains("web development")
                || lower.contains("research")
                || lower.contains("software")
                || lower.contains("engineering"));
    }

    // =============================================================
    // INTERNSHIP ROLE
    // =============================================================
    private String extractInternshipRole(
            String line) {

        String role
                = line;

        role
                = role.replaceFirst(
                        "(?i)\\s*\\d+\\s*[–-]\\s*\\d+\\s*Months",
                        ""
                );

        role
                = role.replaceFirst(
                        "(?i)\\s*Ongoing",
                        ""
                );

        return role.trim();
    }

    // =============================================================
    // INTERNSHIP DURATION
    // =============================================================
    private String extractInternshipDuration(
            String line) {

        Matcher matcher
                = Pattern.compile(
                        "(\\d+\\s*[–-]\\s*\\d+\\s*Months|Ongoing)",
                        Pattern.CASE_INSENSITIVE
                ).matcher(line);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return "";
    }

    // =============================================================
    // INTERNSHIP TYPE
    // =============================================================
    private String extractInternshipType(
            String line) {

        String lower
                = line.toLowerCase();

        if (lower.contains("research")) {
            return "Research Internship";
        }

        if (lower.contains("web development")) {
            return "Web Development Internship";
        }

        return "Internship";
    }

    // =============================================================
    // ACHIEVEMENTS
    // =============================================================
    private List<String> extractAchievements(
            String achievementText) {

        List<String> achievements
                = new ArrayList<>();

        if (achievementText == null
                || achievementText.isBlank()) {

            return achievements;
        }

        String[] lines
                = achievementText.split("\n");

        StringBuilder currentAchievement
                = new StringBuilder();

        for (String line
                : lines) {

            String trimmed
                    = line.trim();

            if (trimmed.isEmpty()) {
                continue;
            }

            boolean bullet
                    = trimmed.matches(
                            "^[•●▪◦\\-].*"
                    );

            String cleanedLine
                    = trimmed.replaceFirst(
                            "^[•●▪◦\\-]\\s*",
                            ""
                    ).trim();

            if (bullet) {

                if (currentAchievement.length() > 0) {

                    achievements.add(
                            currentAchievement
                                    .toString()
                                    .trim()
                    );
                }

                currentAchievement
                        = new StringBuilder(
                                cleanedLine
                        );

            } else {

                if (currentAchievement.length() > 0) {

                    currentAchievement
                            .append(" ")
                            .append(cleanedLine);

                } else {

                    currentAchievement
                            = new StringBuilder(
                                    cleanedLine
                            );
                }
            }
        }

        if (currentAchievement.length() > 0) {

            achievements.add(
                    currentAchievement
                            .toString()
                            .trim()
            );
        }

        return achievements;
    }

    // =============================================================
    // CERTIFICATIONS
    // =============================================================
    private List<String> extractCertifications(
            String certificationText) {

        List<String> certifications
                = new ArrayList<>();

        if (certificationText == null
                || certificationText.isBlank()) {

            return certifications;
        }

        String[] lines
                = certificationText.split("\n");

        StringBuilder currentCertification
                = new StringBuilder();

        for (String line
                : lines) {

            String trimmed
                    = line.trim();

            if (trimmed.isEmpty()) {
                continue;
            }

            boolean bullet
                    = trimmed.matches(
                            "^[•●▪◦\\-].*"
                    );

            String cleanedLine
                    = trimmed.replaceFirst(
                            "^[•●▪◦\\-]\\s*",
                            ""
                    ).trim();

            if (bullet) {

                if (currentCertification.length() > 0) {

                    certifications.add(
                            currentCertification
                                    .toString()
                                    .trim()
                    );
                }

                currentCertification
                        = new StringBuilder(
                                cleanedLine
                        );

            } else {

                if (currentCertification.length() > 0) {

                    currentCertification
                            .append(" ")
                            .append(cleanedLine);

                } else {

                    currentCertification
                            = new StringBuilder(
                                    cleanedLine
                            );
                }
            }
        }

        if (currentCertification.length() > 0) {

            certifications.add(
                    currentCertification
                            .toString()
                            .trim()
            );
        }

        return certifications;
    }

    // =============================================================
    // UNIVERSITY
    // =============================================================
    private String extractUniversity(
            String education) {

        String[] lines
                = education.split("\n");

        for (String line
                : lines) {

            String cleanedLine
                    = line.trim();

            String lower
                    = cleanedLine.toLowerCase();

            if (lower.contains("university")
                    || lower.contains("college")) {

                if (cleanedLine.contains("|")) {

                    cleanedLine
                            = cleanedLine
                                    .split("\\|")[0]
                                    .trim();
                }

                if (cleanedLine.contains(",")) {

                    cleanedLine
                            = cleanedLine
                                    .split(",")[0]
                                    .trim();
                }

                return cleanedLine;
            }
        }

        return "";
    }

    // =============================================================
    // EDUCATION CITY
    // =============================================================
    private String extractEducationCity(
            String education) {

        Pattern pattern
                = Pattern.compile(
                        "(Hyderabad|Bangalore|Bengaluru|Mumbai|Delhi|Chennai|Pune|Kolkata)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(education);

        if (matcher.find()) {
            return matcher.group();
        }

        return "";
    }

    // =============================================================
    // DEGREE
    // =============================================================
    private String extractDegree(
            String education) {

        Pattern pattern
                = Pattern.compile(
                        "(B\\.?Tech|B\\.?E\\.?|M\\.?Tech|M\\.?E\\.?|BCA|MCA|BSc|MSc|Bachelor of Technology|Bachelor of Engineering)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(education);

        if (matcher.find()) {

            String degree
                    = matcher.group();

            String normalized
                    = degree.replace(
                            ".",
                            ""
                    );

            if (normalized.equalsIgnoreCase(
                    "BTech")) {

                return "B.Tech";
            }

            if (normalized.equalsIgnoreCase(
                    "BE")) {

                return "B.E.";
            }

            if (normalized.equalsIgnoreCase(
                    "MTech")) {

                return "M.Tech";
            }

            if (normalized.equalsIgnoreCase(
                    "ME")) {

                return "M.E.";
            }

            return degree;
        }

        return "";
    }

    // =============================================================
    // BRANCH
    // =============================================================
    private String extractBranch(
            String education) {

        String lower
                = education.toLowerCase();

        if (lower.contains(
                "computer science engineering")
                || lower.contains(
                        "computer science and engineering")
                || lower.contains(
                        "computer science & engineering")) {

            return "Computer Science Engineering";
        }

        if (lower.contains(
                "electronics and communication engineering")
                || lower.contains(
                        "electronics & communication engineering")) {

            return "Electronics and Communication Engineering";
        }

        if (lower.contains(
                "electrical and electronics engineering")) {

            return "Electrical and Electronics Engineering";
        }

        if (lower.contains(
                "information technology")) {

            return "Information Technology";
        }

        if (lower.contains(
                "mechanical engineering")) {

            return "Mechanical Engineering";
        }

        if (lower.contains(
                "civil engineering")) {

            return "Civil Engineering";
        }

        Pattern pattern
                = Pattern.compile(
                        "\\b(CSE|ECE|EEE|IT)\\b",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(education);

        if (matcher.find()) {

            String branch
                    = matcher.group()
                            .toUpperCase();

            switch (branch) {

                case "CSE":
                    return "Computer Science Engineering";

                case "ECE":
                    return "Electronics and Communication Engineering";

                case "EEE":
                    return "Electrical and Electronics Engineering";

                case "IT":
                    return "Information Technology";

                default:
                    return branch;
            }
        }

        return "";
    }

    // =============================================================
    // CGPA
    // =============================================================
    private String extractCGPA(
            String education) {

        Pattern pattern
                = Pattern.compile(
                        "(?:CGPA|C\\.G\\.P\\.A\\.?|GPA)\\s*[:\\-]?\\s*(\\d+(?:\\.\\d+)?)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher
                = pattern.matcher(education);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return "";
    }

    // =============================================================
    // GRADUATION YEAR
    // =============================================================
    private String extractGraduationYear(
            String education) {

        Pattern pattern
                = Pattern.compile(
                        "\\b(20\\d{2})\\b"
                );

        Matcher matcher
                = pattern.matcher(education);

        String latestYear
                = "";

        while (matcher.find()) {

            String year
                    = matcher.group(1);

            try {

                int numericYear
                        = Integer.parseInt(year);

                if (numericYear >= 2020
                        && numericYear <= 2040) {

                    latestYear
                            = year;
                }

            } catch (NumberFormatException ignored) {
            }
        }

        return latestYear;
    }

    // =============================================================
    // SECTION EXTRACTION
    // =============================================================
    private String extractSection(
            String text,
            String startHeading,
            String endHeading) {

        String upperText
                = text.toUpperCase();

        int startIndex
                = upperText.indexOf(
                        startHeading.toUpperCase()
                );

        if (startIndex == -1) {
            return "";
        }

        startIndex
                += startHeading.length();

        int endIndex;

        if (endHeading != null) {

            endIndex
                    = upperText.indexOf(
                            endHeading.toUpperCase(),
                            startIndex
                    );

            if (endIndex == -1) {
                endIndex
                        = text.length();
            }

        } else {

            endIndex
                    = text.length();
        }

        return text.substring(
                startIndex,
                endIndex
        ).trim();
    }
}
