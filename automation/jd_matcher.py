import re
import requests
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

SPRING_BOOT_URL = "http://localhost:8080"

RESUME_FILE = "24EG105V33_P.SHESHENDRAKASHYAP.pdf"

JD_FILE = Path("test_jd.txt")


# ============================================================
# 1. GET RESUME FROM SPRING BOOT
# ============================================================

print()
print("Getting resume profile...")

try:

    response = requests.get(
        f"{SPRING_BOOT_URL}/api/resume/parse",
        params={
            "fileName": RESUME_FILE
        },
        timeout=10
    )

    response.raise_for_status()

except requests.RequestException as e:

    print("Failed to get resume data.")
    print(e)

    exit()


profile = response.json()

resume_skills = profile.get(
    "skills",
    []
)


# ============================================================
# 2. READ JOB DESCRIPTION
# ============================================================

if not JD_FILE.exists():

    print("test_jd.txt not found.")

    exit()


jd_text = JD_FILE.read_text(
    encoding="utf-8"
)


# ============================================================
# 3. SKILL ALIASES
# ============================================================

SKILL_ALIASES = {

    "Java": [
        "java"
    ],

    "Python": [
        "python"
    ],

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
        "mysql",
        "postgresql",
        "postgres"
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
        "rest api development",
        "restful api design",
        "restful api development"
    ],

    "Git": [
        "git",
        "github",
        "git version control",
        "git and github"
    ],

    "React": [
        "react",
        "react.js",
        "reactjs"
    ],

    "JavaScript": [
        "javascript",
        "java script",
        "js"
    ],

    "HTML": [
        "html",
        "html5"
    ],

    "CSS": [
        "css",
        "css3"
    ],

    "Data Structures and Algorithms": [
        "data structures and algorithms",
        "data structures & algorithms",
        "data structures",
        "algorithms",
        "dsa"
    ],

    "Docker": [
        "docker"
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
    ]
}


# ============================================================
# 4. NORMALIZE TEXT
# ============================================================

def normalize_text(text):

    if text is None:

        return ""

    text = str(text).lower()

    # Normalize punctuation

    text = text.replace(
        "-",
        " "
    )

    text = text.replace(
        "_",
        " "
    )

    text = text.replace(
        "/",
        " "
    )

    # Remove extra spaces

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# 5. CHECK SKILL IN TEXT
# ============================================================

def contains_skill(text, aliases):

    normalized_text = normalize_text(
        text
    )

    for alias in aliases:

        normalized_alias = normalize_text(
            alias
        )

        pattern = (
            r"(?<!\w)"
            + re.escape(normalized_alias)
            + r"(?!\w)"
        )

        if re.search(
            pattern,
            normalized_text
        ):

            return True

    return False


# ============================================================
# 6. CHECK SKILL IN RESUME SKILL LIST
# ============================================================

def skill_exists_in_resume(
        canonical_skill,
        resume_skills
):

    aliases = SKILL_ALIASES[
        canonical_skill
    ]

    for resume_skill in resume_skills:

        resume_skill_normalized = (
            normalize_text(resume_skill)
        )

        # ----------------------------------------------------
        # Direct alias match
        # ----------------------------------------------------

        if contains_skill(
            resume_skill_normalized,
            aliases
        ):

            return True

        # ----------------------------------------------------
        # Canonical skill contained inside
        # a longer resume skill
        #
        # Example:
        #
        # "REST API"
        # inside
        # "REST API Design"
        # ----------------------------------------------------

        canonical_normalized = (
            normalize_text(
                canonical_skill
            )
        )

        if (
            canonical_normalized
            in resume_skill_normalized
        ):

            return True

    return False


# ============================================================
# 7. EXTRACT JD SKILLS
# ============================================================

jd_skills = []

for canonical_skill, aliases in SKILL_ALIASES.items():

    if contains_skill(
        jd_text,
        aliases
    ):

        jd_skills.append(
            canonical_skill
        )


# ============================================================
# 8. COMPARE RESUME AND JD
# ============================================================

matched = []

missing = []


for jd_skill in jd_skills:

    if skill_exists_in_resume(
        jd_skill,
        resume_skills
    ):

        matched.append(
            jd_skill
        )

    else:

        missing.append(
            jd_skill
        )


# ============================================================
# 9. CALCULATE MATCH SCORE
# ============================================================

if len(jd_skills) > 0:

    score = round(
        len(matched)
        / len(jd_skills)
        * 100
    )

else:

    score = 0


# ============================================================
# 10. DISPLAY RESULTS
# ============================================================

print()

print(
    "===================================="
)

print(
    "        INTERNPILOT AI MATCH"
)

print(
    "===================================="
)


print()

print(
    "JD SKILLS:"
)

for skill in jd_skills:

    print(
        " -",
        skill
    )


print()

print(
    "MATCHED SKILLS:"
)

for skill in matched:

    print(
        " +",
        skill
    )


print()

print(
    "MISSING SKILLS:"
)

if len(missing) == 0:

    print(
        " None"
    )

else:

    for skill in missing:

        print(
            " -",
            skill
        )


print()

print(
    "MATCH SCORE:",
    str(score) + "%"
)


print()

print(
    "===================================="
)
