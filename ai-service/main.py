from fastapi import FastAPI
from pydantic import BaseModel
import re
import requests


app = FastAPI(
    title="InternPilot AI Service",
    description="JD analysis and ATS application tailoring service"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class TailorRequest(BaseModel):

    fileName: str
    jobDescription: str
    question: str


# ============================================================
# CONFIGURATION
# ============================================================

SPRING_BOOT_URL = "http://localhost:8080"


# ============================================================
# SKILL ALIASES
# ============================================================

SKILL_ALIASES = {

    "Java": ["java"],

    "Python": ["python"],

    "C": [
        "c programming",
        "c language"
    ],

    "C++": [
        "c++",
        "cpp"
    ],

    "SQL": [
        "sql",
        "mysql"
    ],

    "Spring Boot": [
        "spring boot",
        "springboot"
    ],

    "REST API": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
        "rest api design",
        "restful services"
    ],

    "Git": [
        "git",
        "github",
        "git and github"
    ],

    "JavaScript": [
        "javascript",
        "js"
    ],

    "React": [
        "react",
        "react.js",
        "reactjs"
    ],

    "HTML": [
        "html",
        "html5"
    ],

    "CSS": [
        "css",
        "css3"
    ],

    "DSA": [
        "data structures",
        "data structures and algorithms",
        "algorithms",
        "dsa"
    ],

    "Docker": [
        "docker",
        "containerization",
        "containers"
    ],

    "Kubernetes": [
        "kubernetes",
        "k8s"
    ],

    "AWS": [
        "aws",
        "amazon web services"
    ],

    "Machine Learning": [
        "machine learning",
        "machine-learning",
        "ml"
    ],

    "NLP": [
        "nlp",
        "natural language processing"
    ],

    "OOP": [
        "object oriented programming",
        "object-oriented programming",
        "oops",
        "oop"
    ],

    "Postman": [
        "postman"
    ],

    "Linux": [
        "linux"
    ]
}


# ============================================================
# GET RESUME
# ============================================================

def get_resume_from_backend(file_name):

    response = requests.get(
        f"{SPRING_BOOT_URL}/api/resume/parse",
        params={
            "fileName": file_name
        },
        timeout=10
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize_text(text):

    if text is None:
        return ""

    text = str(text).lower()

    text = text.replace("\u2013", "-")
    text = text.replace("\u2014", "-")

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# CHECK SKILL
# ============================================================

def contains_skill(text, variations):

    text = normalize_text(text)

    for variation in variations:

        variation = normalize_text(
            variation
        )

        pattern = (
            r"(?<!\w)"
            + re.escape(variation)
            + r"(?!\w)"
        )

        if re.search(pattern, text):
            return True

    return False


# ============================================================
# BUILD RESUME TEXT
# ============================================================

def build_resume_text(profile):

    parts = [

        profile.get("name", ""),
        profile.get("summary", ""),
        profile.get("skills", ""),
        profile.get("experience", ""),
        profile.get("projects", ""),
        profile.get("education", ""),
        profile.get("achievements", ""),
        profile.get("certifications", "")

    ]

    return " ".join(
        str(part)
        for part in parts
    )


# ============================================================
# ANALYZE JD
# ============================================================

def analyze_job_description(
        resume_text,
        job_description
):

    matched_skills = []
    missing_skills = []
    detected_skills = []

    for skill, variations in SKILL_ALIASES.items():

        if contains_skill(
            job_description,
            variations
        ):

            detected_skills.append(skill)

            if contains_skill(
                resume_text,
                variations
            ):

                matched_skills.append(skill)

            else:

                missing_skills.append(skill)

    total_skills = len(
        detected_skills
    )

    if total_skills == 0:
        score = 0
    else:
        score = int(
            len(matched_skills)
            * 100
            / total_skills
        )

    return {

        "detectedSkills":
            detected_skills,

        "matchedSkills":
            matched_skills,

        "missingSkills":
            missing_skills,

        "matchScore":
            score
    }


# ============================================================
# EXTRACT HIGHLIGHTS
# ============================================================

def extract_highlights(profile):

    highlights = []

    complete_text = normalize_text(
        " ".join([
            str(profile.get("projects", "")),
            str(profile.get("experience", "")),
            str(profile.get("skills", "")),
            str(profile.get("summary", ""))
        ])
    )

    if contains_skill(
        complete_text,
        SKILL_ALIASES["Java"]
    ):
        highlights.append("Java")

    if contains_skill(
        complete_text,
        SKILL_ALIASES["Spring Boot"]
    ):
        highlights.append("Spring Boot")

    if contains_skill(
        complete_text,
        SKILL_ALIASES["REST API"]
    ):
        highlights.append(
            "REST API development"
        )

    if contains_skill(
        complete_text,
        SKILL_ALIASES["SQL"]
    ):
        highlights.append(
            "SQL and database work"
        )

    if contains_skill(
        complete_text,
        SKILL_ALIASES["Git"]
    ):
        highlights.append(
            "Git/GitHub"
        )

    if contains_skill(
        complete_text,
        SKILL_ALIASES["Python"]
    ):
        highlights.append("Python")

    if contains_skill(
        complete_text,
        SKILL_ALIASES["React"]
    ):
        highlights.append("React")

    if contains_skill(
        complete_text,
        SKILL_ALIASES["Machine Learning"]
    ):
        highlights.append(
            "machine learning"
        )

    if contains_skill(
        complete_text,
        SKILL_ALIASES["NLP"]
    ):
        highlights.append("NLP")

    if contains_skill(
        complete_text,
        SKILL_ALIASES["DSA"]
    ):
        highlights.append(
            "data structures and algorithms"
        )

    return highlights


# ============================================================
# FORMAT SKILLS
# ============================================================

def format_skills(skills):

    if not skills:
        return ""

    return ", ".join(skills)


# ============================================================
# QUESTION TYPE DETECTION
# ============================================================

def detect_question_type(question):

    q = normalize_text(question)

    # ABOUT YOURSELF

    if (
        "tell me about yourself" in q
        or "introduce yourself" in q
        or "about yourself" in q
        or "briefly describe yourself" in q
        or "describe yourself" in q
    ):

        return "ABOUT"


    # WHY INTERESTED

    if (
        "why are you interested" in q
        or "why do you want" in q
        or "why this internship" in q
        or "why this role" in q
        or "why did you apply" in q
        or "what interests you" in q
        or "why are you applying" in q
    ):

        return "WHY_INTERESTED"


    # WHY HIRE / GOOD FIT

    if (
        "why should we hire" in q
        or "why should we select" in q
        or "why should we choose" in q
        or "why are you a good fit" in q
        or "why are you suitable" in q
        or "why are you the right fit" in q
        or "why are you a strong candidate" in q
        or "what makes you a good fit" in q
        or "what makes you suitable" in q
        or "why do you think you are a good fit" in q
    ):

        return "WHY_HIRE"


    # EXPERIENCE

    if (
        "previous experience" in q
        or "relevant experience" in q
        or "describe your experience" in q
        or "work experience" in q
    ):

        return "EXPERIENCE"


    return "DEFAULT"


# ============================================================
# GENERATE ANSWER
# ============================================================

def generate_answer(
        question,
        analysis,
        profile
):

    question_type = detect_question_type(
        question
    )

    matched_skills = analysis[
        "matchedSkills"
    ]

    highlights = extract_highlights(
        profile
    )

    matched_text = format_skills(
        matched_skills
    )

    highlight_text = format_skills(
        highlights
    )

    name = profile.get(
        "name",
        ""
    )


    # ========================================================
    # ABOUT
    # ========================================================

    if question_type == "ABOUT":

        answer = (
            f"I am {name}, a Computer Science "
            "Engineering student interested in "
            "software development and building "
            "practical technical projects. "
        )

        if matched_text:

            answer += (
                f"My technical background includes "
                f"{matched_text}. "
            )

        if highlight_text:

            answer += (
                f"I have applied skills such as "
                f"{highlight_text} through my "
                "academic and project work. "
            )

        answer += (
            "I enjoy solving programming problems, "
            "learning new technologies, and building "
            "practical solutions to real-world problems."
        )

        return answer


    # ========================================================
    # WHY INTERESTED
    # ========================================================

    if question_type == "WHY_INTERESTED":

        answer = (
            "I am interested in this opportunity "
            "because it allows me to apply my existing "
            "software development skills in a practical "
            "engineering environment. "
        )

        if matched_text:

            answer += (
                f"The role's focus on {matched_text} "
                "matches my current technical background. "
            )

        answer += (
            "I also want to work on real-world problems, "
            "learn from experienced developers, and "
            "continue improving my ability to build "
            "clean and maintainable software."
        )

        return answer


    # ========================================================
    # WHY HIRE
    # ========================================================

    if question_type == "WHY_HIRE":

        answer = (
            "I believe I would be a good fit for this "
            "opportunity because I have a strong "
            "foundation in Computer Science and "
            "hands-on experience building technical "
            "projects. "
        )

        if matched_text:

            answer += (
                f"My relevant skills include "
                f"{matched_text}. "
            )

        if highlight_text:

            answer += (
                f"I have applied these skills through "
                f"{highlight_text} in my academic and "
                "project work. "
            )

        answer += (
            "I am comfortable learning new technologies, "
            "solving problems systematically, and "
            "working consistently to improve my technical "
            "skills. I would bring a willingness to learn "
            "and contribute to the team while developing "
            "as a software engineer."
        )

        return answer


    # ========================================================
    # EXPERIENCE
    # ========================================================

    if question_type == "EXPERIENCE":

        experience = str(
            profile.get(
                "experience",
                ""
            )
        ).strip()

        projects = str(
            profile.get(
                "projects",
                ""
            )
        ).strip()

        if experience:

            return (
                "I have gained practical experience "
                "through my technical projects and "
                "development work. "
                + experience[:900]
            )

        if projects:

            return (
                "My practical experience has primarily "
                "come through academic and personal "
                "technical projects, where I have worked "
                "with technologies such as "
                + highlight_text
                + "."
            )

        return (
            "My practical experience has primarily "
            "come through academic and technical "
            "projects, where I have applied my "
            "programming and software development skills."
        )


    # ========================================================
    # DEFAULT
    # ========================================================

    answer = (
        "I am a Computer Science Engineering student "
        "with experience in software development and "
        "technical projects. "
    )

    if matched_text:

        answer += (
            f"My relevant skills include "
            f"{matched_text}. "
        )

    answer += (
        "I am interested in applying these skills "
        "to practical engineering problems while "
        "continuing to develop my technical abilities."
    )

    return answer


# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def home():

    return {
        "message":
            "InternPilot AI Service is running"
    }


@app.get("/health")
def health():

    return {
        "status":
            "healthy"
    }


# ============================================================
# TAILOR
# ============================================================

@app.post("/tailor")
def tailor_application(
        request: TailorRequest
):

    profile = get_resume_from_backend(
        request.fileName
    )

    resume_text = build_resume_text(
        profile
    )

    analysis = analyze_job_description(
        resume_text,
        request.jobDescription
    )

    answer = generate_answer(
        request.question,
        analysis,
        profile
    )

    question_type = detect_question_type(
        request.question
    )

    return {

        "question":
            request.question,

        "questionType":
            question_type,

        "fileName":
            request.fileName,

        "detectedSkills":
            analysis[
                "detectedSkills"
            ],

        "matchedSkills":
            analysis[
                "matchedSkills"
            ],

        "missingSkills":
            analysis[
                "missingSkills"
            ],

        "matchScore":
            analysis[
                "matchScore"
            ],

        "answer":
            answer,

        # Keep this for compatibility
        # with your existing popup.js

        "whyHire":
            answer
    }