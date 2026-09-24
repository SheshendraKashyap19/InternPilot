package com.internpilot.internpilot.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.internpilot.internpilot.model.Student;
import com.internpilot.internpilot.service.ResumeParserService;
import com.internpilot.internpilot.service.ResumeService;
import com.internpilot.internpilot.service.StudentProfileService;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    private final String uploadDir = "uploads/";

    private final ResumeService resumeService;
    private final ResumeParserService resumeParserService;
    private final StudentProfileService studentProfileService;

    public ResumeController(
            ResumeService resumeService,
            ResumeParserService resumeParserService,
            StudentProfileService studentProfileService) {

        this.resumeService = resumeService;
        this.resumeParserService = resumeParserService;
        this.studentProfileService = studentProfileService;
    }

    // =====================================================
    // UPLOAD RESUME
    // =====================================================
    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file) {

        try {

            if (file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please select a resume file.");
            }

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = file.getOriginalFilename();

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Invalid file name.");
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, file.getBytes());

            return ResponseEntity.ok(
                    "Resume uploaded successfully: " + fileName
            );

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to upload resume.");
        }
    }

    // =====================================================
    // EXTRACT RESUME TEXT
    // =====================================================
    @GetMapping("/extract")
    public ResponseEntity<String> extractResumeText(
            @RequestParam("fileName") String fileName) {

        try {

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please provide a file name.");
            }

            String filePath = uploadDir + fileName;

            String text
                    = resumeService.extractText(filePath);

            return ResponseEntity.ok(text);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to extract resume text.");
        }
    }

    // =====================================================
    // PARSE RESUME
    // =====================================================
    @GetMapping("/parse")
    public ResponseEntity<?> parseResume(
            @RequestParam("fileName") String fileName) {

        try {

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please provide a file name.");
            }

            String filePath = uploadDir + fileName;

            String text
                    = resumeService.extractText(filePath);

            Map<String, Object> profile
                    = resumeParserService.parseResume(text);

            return ResponseEntity.ok(profile);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to parse resume.");
        }
    }

    // =====================================================
    // SAVE PARSED RESUME TO DATABASE
    // =====================================================
    @PostMapping("/save")
    public ResponseEntity<?> saveResume(
            @RequestParam("fileName") String fileName,
            @RequestParam("rollNo") String rollNo) {

        try {

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please provide a file name.");
            }

            if (rollNo == null || rollNo.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please provide a roll number.");
            }

            String filePath = uploadDir + fileName;

            // Extract PDF text
            String text
                    = resumeService.extractText(filePath);

            // Parse resume
            Map<String, Object> profile
                    = resumeParserService.parseResume(text);

            // Save everything to MySQL
            Student student
                    = studentProfileService.saveProfile(
                            profile,
                            rollNo
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Resume profile saved successfully",
                            "studentId",
                            student.getId(),
                            "rollNo",
                            student.getRollNo(),
                            "name",
                            student.getName(),
                            "email",
                            student.getEmail()
                    )
            );

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to process resume.");

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to save resume profile: "
                            + e.getMessage()
                    );
        }
    }
}
