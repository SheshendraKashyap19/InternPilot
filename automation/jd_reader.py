from pathlib import Path
import re


# -----------------------------
# 1. Read Job Description
# -----------------------------

jd_file = Path("test_jd.txt")

if not jd_file.exists():
    print("Job description file not found!")
    exit()

jd_text = jd_file.read_text(encoding="utf-8")


# -----------------------------
# 2. Extract basic information
# -----------------------------

lines = [
    line.strip()
    for line in jd_text.splitlines()
    if line.strip()
]

job_title = lines[0] if lines else ""


# -----------------------------
# 3. Extract skills
# -----------------------------

known_skills = [
    "Java",
    "Python",
    "C",
    "C++",
    "SQL",
    "Spring Boot",
    "REST APIs",
    "REST API",
    "Git",
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Data Structures and Algorithms",
    "Docker",
    "Kubernetes",
    "AWS",
    "Machine Learning",
    "NLP"
]

found_skills = []

jd_lower = jd_text.lower()

for skill in known_skills:

    if skill.lower() in jd_lower:

        if skill not in found_skills:
            found_skills.append(skill)


# -----------------------------
# 4. Display extracted data
# -----------------------------

print()
print("====================================")
print("JOB DESCRIPTION ANALYSIS")
print("====================================")

print("Job Title:", job_title)

print()
print("Skills Required:")

for skill in found_skills:
    print("-", skill)

print()
print("====================================")
print("JOB DESCRIPTION READ SUCCESSFULLY!")
print("====================================")