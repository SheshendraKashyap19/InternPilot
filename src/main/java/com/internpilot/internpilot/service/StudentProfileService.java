package com.internpilot.internpilot.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.internpilot.internpilot.model.Achievement;
import com.internpilot.internpilot.model.Certification;
import com.internpilot.internpilot.model.Internship;
import com.internpilot.internpilot.model.InternshipDetail;
import com.internpilot.internpilot.model.Project;
import com.internpilot.internpilot.model.ProjectTechnology;
import com.internpilot.internpilot.model.Skill;
import com.internpilot.internpilot.model.Student;
import com.internpilot.internpilot.repository.AchievementRepository;
import com.internpilot.internpilot.repository.CertificationRepository;
import com.internpilot.internpilot.repository.InternshipDetailRepository;
import com.internpilot.internpilot.repository.InternshipRepository;
import com.internpilot.internpilot.repository.ProjectRepository;
import com.internpilot.internpilot.repository.ProjectTechnologyRepository;
import com.internpilot.internpilot.repository.SkillRepository;
import com.internpilot.internpilot.repository.StudentRepository;

@Service
public class StudentProfileService {

    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTechnologyRepository projectTechnologyRepository;
    private final InternshipRepository internshipRepository;
    private final InternshipDetailRepository internshipDetailRepository;
    private final CertificationRepository certificationRepository;
    private final AchievementRepository achievementRepository;

    public StudentProfileService(
            StudentRepository studentRepository,
            SkillRepository skillRepository,
            ProjectRepository projectRepository,
            ProjectTechnologyRepository projectTechnologyRepository,
            InternshipRepository internshipRepository,
            InternshipDetailRepository internshipDetailRepository,
            CertificationRepository certificationRepository,
            AchievementRepository achievementRepository) {

        this.studentRepository = studentRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.projectTechnologyRepository = projectTechnologyRepository;
        this.internshipRepository = internshipRepository;
        this.internshipDetailRepository = internshipDetailRepository;
        this.certificationRepository = certificationRepository;
        this.achievementRepository = achievementRepository;
    }

    @Transactional
    public Student saveProfile(
            Map<String, Object> profile,
            String rollNo) {

        /*
         * The parser stores structured profile information
         * inside the "student" object.
         */
        Map<?, ?> studentData = null;

        Object studentObject = profile.get("student");

        if (studentObject instanceof Map<?, ?>) {
            studentData = (Map<?, ?>) studentObject;
        }

        /*
         * Create or update the student.
         */
        Student student = studentRepository
                .findByRollNo(rollNo)
                .orElseGet(Student::new);

        student.setRollNo(rollNo);

        // Basic information
        student.setName(getString(profile, "name", studentData, "name"));
        student.setEmail(getString(profile, "email", studentData, "email"));
        student.setPhone(getString(profile, "phone", studentData, "phone"));
        student.setLocation(getString(profile, "location", studentData, "location"));

        // Social links
        student.setLinkedin(
                getNestedString(studentData, "linkedin")
        );

        student.setGithub(
                getNestedString(studentData, "github")
        );

        // Summary
        student.setSummary(
                getString(profile, "summary", null, null)
        );

        /*
         * Education is inside:
         *
         * student -> education
         */
        Object educationObject = null;

        if (studentData != null) {
            educationObject = studentData.get("education");
        }

        if (educationObject instanceof Map<?, ?> education) {

            student.setUniversity(
                    getMapValue(education, "university")
            );

            student.setCity(
                    getMapValue(education, "city")
            );

            student.setDegree(
                    getMapValue(education, "degree")
            );

            student.setBranch(
                    getMapValue(education, "branch")
            );

            student.setCgpa(
                    getMapValue(education, "cgpa")
            );

            student.setGraduationYear(
                    getMapValue(education, "graduationYear")
            );
        }

        student = studentRepository.save(student);

        /*
         * ------------------------------------------------
         * SKILLS
         * ------------------------------------------------
         */
        Object skillsObject = null;

        if (studentData != null) {
            skillsObject = studentData.get("skills");
        }

        if (skillsObject instanceof List<?> skills) {

            for (Object skillObject : skills) {

                if (skillObject == null) {
                    continue;
                }

                String skillName = skillObject.toString().trim();

                if (skillName.isEmpty()) {
                    continue;
                }

                Skill skill = new Skill();

                skill.setSkill(skillName);
                skill.setStudent(student);

                skillRepository.save(skill);
            }
        }

        /*
         * ------------------------------------------------
         * PROJECTS
         * ------------------------------------------------
         */
        Object projectsObject = null;

        if (studentData != null) {
            projectsObject = studentData.get("projects");
        }

        if (projectsObject instanceof List<?> projects) {

            for (Object projectObject : projects) {

                if (!(projectObject instanceof Map<?, ?> projectData)) {
                    continue;
                }

                Project project = new Project();

                project.setName(
                        getMapValue(projectData, "name")
                );

                project.setDescription(
                        getDetails(projectData.get("details"))
                );

                project.setStudent(student);

                project = projectRepository.save(project);

                /*
                 * Project technologies
                 */
                Object technologiesObject
                        = projectData.get("technologies");

                if (technologiesObject instanceof List<?> technologies) {

                    for (Object technologyObject : technologies) {

                        if (technologyObject == null) {
                            continue;
                        }

                        String technology
                                = technologyObject.toString().trim();

                        if (technology.isEmpty()) {
                            continue;
                        }

                        ProjectTechnology projectTechnology
                                = new ProjectTechnology();

                        projectTechnology.setTechnology(technology);
                        projectTechnology.setProject(project);

                        projectTechnologyRepository.save(
                                projectTechnology
                        );
                    }
                }
            }
        }

        /*
         * ------------------------------------------------
         * INTERNSHIPS
         * ------------------------------------------------
         */
        Object internshipsObject = null;

        if (studentData != null) {
            internshipsObject = studentData.get("internships");
        }

        if (internshipsObject instanceof List<?> internships) {

            for (Object internshipObject : internships) {

                if (!(internshipObject instanceof Map<?, ?> internshipData)) {
                    continue;
                }

                Internship internship = new Internship();

                internship.setRole(
                        getMapValue(internshipData, "role")
                );

                internship.setCompany(
                        getMapValue(internshipData, "company")
                );

                internship.setDuration(
                        getMapValue(internshipData, "duration")
                );

                internship.setType(
                        getMapValue(internshipData, "type")
                );

                internship.setStudent(student);

                internship
                        = internshipRepository.save(internship);

                /*
                 * Internship details
                 */
                Object detailsObject
                        = internshipData.get("details");

                if (detailsObject instanceof List<?> details) {

                    for (Object detailObject : details) {

                        if (detailObject == null) {
                            continue;
                        }

                        String description
                                = detailObject.toString().trim();

                        if (description.isEmpty()) {
                            continue;
                        }

                        InternshipDetail detail
                                = new InternshipDetail();

                        detail.setDescription(description);
                        detail.setInternship(internship);

                        internshipDetailRepository.save(detail);
                    }
                }
            }
        }

        /*
         * ------------------------------------------------
         * CERTIFICATIONS
         * ------------------------------------------------
         */
        Object certificationsObject = null;

        if (studentData != null) {
            certificationsObject = studentData.get("certifications");
        }

        if (certificationsObject instanceof List<?> certifications) {

            for (Object certificationObject : certifications) {

                if (certificationObject == null) {
                    continue;
                }

                String certificationName
                        = certificationObject.toString().trim();

                if (certificationName.isEmpty()) {
                    continue;
                }

                Certification certification
                        = new Certification();

                certification.setName(certificationName);
                certification.setStudent(student);

                certificationRepository.save(certification);
            }
        }

        /*
         * ------------------------------------------------
         * ACHIEVEMENTS
         * ------------------------------------------------
         */
        Object achievementsObject = null;

        if (studentData != null) {
            achievementsObject = studentData.get("achievements");
        }

        if (achievementsObject instanceof List<?> achievements) {

            for (Object achievementObject : achievements) {

                if (achievementObject == null) {
                    continue;
                }

                String description
                        = achievementObject.toString().trim();

                if (description.isEmpty()) {
                    continue;
                }

                Achievement achievement
                        = new Achievement();

                achievement.setDescription(description);
                achievement.setStudent(student);

                achievementRepository.save(achievement);
            }
        }

        return student;
    }

    /*
     * Get a value from the top-level profile first.
     * If it does not exist, use the nested student object.
     */
    private String getString(
            Map<String, Object> profile,
            String profileKey,
            Map<?, ?> studentData,
            String studentKey) {

        Object value = profile.get(profileKey);

        if (value != null) {
            return value.toString().trim();
        }

        if (studentData != null && studentKey != null) {

            Object nestedValue
                    = studentData.get(studentKey);

            if (nestedValue != null) {
                return nestedValue.toString().trim();
            }
        }

        return null;
    }

    /*
     * Get nested student value.
     */
    private String getNestedString(
            Map<?, ?> studentData,
            String key) {

        if (studentData == null) {
            return null;
        }

        Object value = studentData.get(key);

        if (value == null) {
            return null;
        }

        return value.toString().trim();
    }

    /*
     * Get value from a Map.
     */
    private String getMapValue(
            Map<?, ?> map,
            String key) {

        Object value = map.get(key);

        if (value == null) {
            return null;
        }

        return value.toString().trim();
    }

    /*
     * Convert the list of project/internship details
     * into one text field.
     */
    private String getDetails(
            Object detailsObject) {

        if (!(detailsObject instanceof List<?> details)) {
            return null;
        }

        StringBuilder result
                = new StringBuilder();

        for (Object detail : details) {

            if (detail == null) {
                continue;
            }

            String text
                    = detail.toString().trim();

            if (text.isEmpty()) {
                continue;
            }

            if (result.length() > 0) {
                result.append("\n");
            }

            result.append(text);
        }

        return result.toString();
    }
}
