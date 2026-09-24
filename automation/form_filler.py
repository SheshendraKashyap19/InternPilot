from pathlib import Path

import requests
from playwright.sync_api import sync_playwright


# ============================================================
# CONFIGURATION
# ============================================================

SPRING_BOOT_URL = "http://localhost:8080"

AI_SERVICE_URL = "http://127.0.0.1:8000"

RESUME_FILE = "24EG105V33_P.SHESHENDRAKASHYAP.pdf"

HTML_FILE = Path(
    "realistic_form.html"
).resolve()


# ============================================================
# GET RESUME PROFILE
# ============================================================

def get_resume_profile():

    print("\nGetting resume profile...")

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

        print("Failed to get resume profile.")
        print(e)

        return None

    profile = response.json()

    print("Resume profile loaded successfully.")

    return profile


# ============================================================
# EXTRACT JOB DESCRIPTION FROM PAGE
# ============================================================

def extract_job_description(page):

    print("\nExtracting Job Description...")

    try:

        jd_element = page.locator(
            "#job-description"
        )

        if jd_element.count() == 0:

            print(
                "Job Description section not found."
            )

            return ""

        job_description = (
            jd_element
            .inner_text()
            .strip()
        )

        if not job_description:

            print(
                "Job Description is empty."
            )

            return ""

        print(
            "Job Description extracted successfully."
        )

        print(
            "\n--------------------------------------"
        )

        print(
            job_description
        )

        print(
            "--------------------------------------"
        )

        return job_description

    except Exception as e:

        print(
            "Failed to extract Job Description."
        )

        print(e)

        return ""


# ============================================================
# SEND JD + QUESTION TO AI SERVICE
# ============================================================


def generate_answer(
        question,
        job_description
):

    print(
        f"\nGenerating answer for:"
        f" {question}"
    )

    try:

        response = requests.post(
            f"{AI_SERVICE_URL}/tailor",
            json={
                "fileName": RESUME_FILE,
                "jobDescription": job_description,
                "question": question
            },
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        # ----------------------------------------------------
        # DISPLAY JD ANALYSIS
        # ----------------------------------------------------

        print(
            "\n======================================"
        )

        print(
            "       INTERNPILOT JD ANALYSIS"
        )

        print(
            "======================================"
        )

        detected_skills = data.get(
            "detectedSkills",
            []
        )

        matched_skills = data.get(
            "matchedSkills",
            []
        )

        missing_skills = data.get(
            "missingSkills",
            []
        )

        match_score = data.get(
            "matchScore",
            0
        )

        print(
            "\nDetected Skills:"
        )

        if detected_skills:

            for skill in detected_skills:

                print(
                    f" - {skill}"
                )

        else:

            print(
                " None"
            )

        print(
            "\nMatched with Resume:"
        )

        if matched_skills:

            for skill in matched_skills:

                print(
                    f" + {skill}"
                )

        else:

            print(
                " None"
            )

        print(
            "\nMissing Skills:"
        )

        if missing_skills:

            for skill in missing_skills:

                print(
                    f" - {skill}"
                )

        else:

            print(
                " None"
            )

        print(
            f"\nMatch Score: {match_score}%"
        )

        print(
            "======================================"
        )

        # ----------------------------------------------------
        # GET GENERATED ANSWER
        # ----------------------------------------------------

        answer = data.get(
            "whyHire",
            ""
        )

        if answer:

            print(
                "Answer generated successfully."
            )

        else:

            print(
                "AI service returned "
                "an empty answer."
            )

        return answer

    except requests.RequestException as e:

        print(
            "AI service error:"
        )

        print(e)

        return ""



# ============================================================
# DETECT NORMAL TEXT FIELD
# ============================================================

def detect_field(field):

    tag_name = field.evaluate(
        "(element) => element.tagName.toLowerCase()"
    )

    # Select elements are handled separately

    if tag_name == "select":

        return None

    input_type = (
        field.get_attribute("type")
        or ""
    ).lower()

    # Radio and checkbox are handled separately

    if input_type in [
        "radio",
        "checkbox"
    ]:

        return None

    # --------------------------------------------------------
    # ATTRIBUTES
    # --------------------------------------------------------

    field_id = (
        field.get_attribute("id")
        or ""
    ).lower()

    field_name = (
        field.get_attribute("name")
        or ""
    ).lower()

    placeholder = (
        field.get_attribute("placeholder")
        or ""
    ).lower()

    aria_label = (
        field.get_attribute("aria-label")
        or ""
    ).lower()

    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    label_text = ""

    try:

        if field_id:

            label = field.locator(
                f"xpath=//label[@for='{field_id}']"
            )

            if label.count() > 0:

                label_text = (
                    label.first
                    .inner_text()
                    .lower()
                )

    except Exception:

        pass

    # --------------------------------------------------------
    # PREVIOUS ELEMENT
    # --------------------------------------------------------

    nearby_text = ""

    try:

        previous = field.locator(
            "xpath=preceding-sibling::*[1]"
        )

        if previous.count() > 0:

            nearby_text = (
                previous
                .inner_text()
                .lower()
            )

    except Exception:

        pass

    # --------------------------------------------------------
    # COMBINE INFORMATION
    # --------------------------------------------------------

    search_text = " ".join([
        field_id,
        field_name,
        placeholder,
        aria_label,
        label_text,
        nearby_text
    ])

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if (
        "email" in search_text
        or "e-mail" in search_text
    ):

        return "email"

    # --------------------------------------------------------
    # PHONE
    # --------------------------------------------------------

    if (
        "phone" in search_text
        or "mobile" in search_text
        or "telephone" in search_text
        or "contact number" in search_text
        or "phone number" in search_text
    ):

        return "phone"

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    if (
        field_id == "name"
        or field_name == "name"
        or "full name" in search_text
        or "candidate name" in search_text
        or "your name" in search_text
    ):

        return "name"

    # --------------------------------------------------------
    # COLLEGE
    # --------------------------------------------------------

    if (
        "college" in search_text
        or "university" in search_text
        or "institution" in search_text
        or "school name" in search_text
    ):

        return "college"

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if (
        "technical skills" in search_text
        or "programming skills" in search_text
        or "skills" in search_text
        or "technologies" in search_text
    ):

        return "skills"

    # --------------------------------------------------------
    # WHY HIRE
    # --------------------------------------------------------

    if (
        "whyhire" in field_id
        or "why_hire" in field_id
        or "why-hire" in field_id
        or "candidate_fit" in field_id
        or "candidate fit" in search_text
        or "why should we hire" in search_text
        or "why hire" in search_text
        or "why are you a good fit" in search_text
        or "why are you suitable" in search_text
        or "why should we select you" in search_text
        or "good fit for this role" in search_text
    ):

        return "whyHire"

    # --------------------------------------------------------
    # ABOUT
    # --------------------------------------------------------

    if (
        "about yourself" in search_text
        or "tell me about yourself" in search_text
        or "introduce yourself" in search_text
        or "candidate_intro" in field_id
    ):

        return "about"

    # --------------------------------------------------------
    # INTEREST
    # --------------------------------------------------------

    if (
        "why are you interested" in search_text
        or "why do you want" in search_text
        or "why this internship" in search_text
        or "why this role" in search_text
        or "why do you want to join" in search_text
        or "motivation" in field_id
    ):

        return "interest"

    return None


# ============================================================
# DETECT RADIO BUTTON
# ============================================================

def detect_radio(field):

    input_type = (
        field.get_attribute("type")
        or ""
    ).lower()

    if input_type != "radio":

        return None

    value = (
        field.get_attribute("value")
        or ""
    ).lower()

    field_id = (
        field.get_attribute("id")
        or ""
    ).lower()

    field_name = (
        field.get_attribute("name")
        or ""
    ).lower()

    search_text = " ".join([
        value,
        field_id,
        field_name
    ])

    if (
        "remote" in search_text
        or "hybrid" in search_text
        or "onsite" in search_text
        or "on-site" in search_text
        or "work_mode" in search_text
    ):

        return "workMode"

    return None


# ============================================================
# DETECT CHECKBOX
# ============================================================

def detect_checkbox(field):

    input_type = (
        field.get_attribute("type")
        or ""
    ).lower()

    if input_type != "checkbox":

        return None

    field_id = (
        field.get_attribute("id")
        or ""
    ).lower()

    field_name = (
        field.get_attribute("name")
        or ""
    ).lower()

    parent_text = ""

    try:

        parent = field.locator(
            "xpath=.."
        )

        if parent.count() > 0:

            parent_text = (
                parent
                .inner_text()
                .lower()
            )

    except Exception:

        pass

    search_text = " ".join([
        field_id,
        field_name,
        parent_text
    ])

    if (
        "confirm" in search_text
        or "accurate" in search_text
        or "information provided" in search_text
        or "agreement" in search_text
    ):

        return "confirmation"

    return None


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print(
        "======================================"
    )

    print(
        "          INTERNPILOT AI"
    )

    print(
        "      APPLICATION AUTOFILL"
    )

    print(
        "======================================"
    )

    # --------------------------------------------------------
    # LOAD RESUME
    # --------------------------------------------------------

    profile = get_resume_profile()

    if profile is None:

        return

    # --------------------------------------------------------
    # START PLAYWRIGHT
    # --------------------------------------------------------

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=False
        )

        page = browser.new_page()

        print(
            "\nOpening application page..."
        )

        page.goto(
            HTML_FILE.as_uri()
        )

        print(
            "Application page opened."
        )

        # ----------------------------------------------------
        # EXTRACT REAL JD FROM PAGE
        # ----------------------------------------------------

        job_description = (
            extract_job_description(
                page
            )
        )

        if not job_description:

            print(
                "\nCannot continue without Job Description."
            )

            browser.close()

            return

        # ----------------------------------------------------
        # FIND FORM FIELDS
        # ----------------------------------------------------

        fields = page.locator(
            "input, textarea, select"
        )

        field_count = fields.count()

        print(
            f"\nFields found: {field_count}"
        )

        # ----------------------------------------------------
        # PROCESS EVERY FIELD
        # ----------------------------------------------------

        for i in range(field_count):

            field = fields.nth(i)

            tag_name = field.evaluate(
                "(element) => element.tagName.toLowerCase()"
            )

            input_type = (
                field.get_attribute("type")
                or ""
            ).lower()

            # ------------------------------------------------
            # RADIO
            # ------------------------------------------------

            if input_type == "radio":

                detected = detect_radio(
                    field
                )

                print(
                    f"\nField {i + 1}: "
                    f"{tag_name} "
                    f"({input_type}) -> "
                    f"{detected}"
                )

                if detected == "workMode":

                    value = (
                        field
                        .get_attribute("value")
                        or ""
                    ).lower()

                    # Use Hybrid as the test
                    # selection.

                    if value == "hybrid":

                        field.check()

                        print(
                            "   Selected: Hybrid"
                        )

                continue

            # ------------------------------------------------
            # CHECKBOX
            # ------------------------------------------------

            if input_type == "checkbox":

                detected = detect_checkbox(
                    field
                )

                print(
                    f"\nField {i + 1}: "
                    f"{tag_name} "
                    f"({input_type}) -> "
                    f"{detected}"
                )

                if detected == "confirmation":

                    field.check()

                    print(
                        "   Checked: Confirmation"
                    )

                continue

            # ------------------------------------------------
            # NORMAL FIELD
            # ------------------------------------------------

            detected = detect_field(
                field
            )

            print(
                f"\nField {i + 1}: "
                f"{tag_name} -> "
                f"{detected}"
            )

            # ------------------------------------------------
            # NAME
            # ------------------------------------------------

            if detected == "name":

                field.fill(
                    profile.get(
                        "name",
                        ""
                    )
                )

            # ------------------------------------------------
            # EMAIL
            # ------------------------------------------------

            elif detected == "email":

                field.fill(
                    profile.get(
                        "email",
                        ""
                    )
                )

            # ------------------------------------------------
            # PHONE
            # ------------------------------------------------

            elif detected == "phone":

                field.fill(
                    profile.get(
                        "phone",
                        ""
                    )
                )

            # ------------------------------------------------
            # COLLEGE
            # ------------------------------------------------

            elif detected == "college":

                field.fill(
                    "Anurag University"
                )

            # ------------------------------------------------
            # SKILLS
            # ------------------------------------------------

            elif detected == "skills":

                skills = profile.get(
                    "skills",
                    []
                )

                skills_text = ", ".join(
                    skills
                )

                field.fill(
                    skills_text
                )

            # ------------------------------------------------
            # ABOUT
            # ------------------------------------------------

            elif detected == "about":

                answer = generate_answer(
                    "Tell me about yourself",
                    job_description
                )

                if answer:

                    field.fill(
                        answer
                    )

            # ------------------------------------------------
            # INTEREST
            # ------------------------------------------------

            elif detected == "interest":

                answer = generate_answer(
                    "Why are you interested in this internship?",
                    job_description
                )

                if answer:

                    field.fill(
                        answer
                    )

            # ------------------------------------------------
            # WHY HIRE
            # ------------------------------------------------

            elif detected == "whyHire":

                answer = generate_answer(
                    "Why should we hire you?",
                    job_description
                )

                if answer:

                    field.fill(
                        answer
                    )

            # ------------------------------------------------
            # SELECT
            # ------------------------------------------------

            elif tag_name == "select":

                options = field.locator(
                    "option"
                )

                for j in range(
                    options.count()
                ):

                    option = options.nth(j)

                    option_text = (
                        option
                        .inner_text()
                        .strip()
                        .lower()
                    )

                    if option_text == "yes":

                        value = (
                            option
                            .get_attribute("value")
                        )

                        field.select_option(
                            value
                        )

                        print(
                            "   Selected: Yes"
                        )

                        break

        # ----------------------------------------------------
        # FINAL SAFETY STOP
        # ----------------------------------------------------

        print()
        print(
            "======================================"
        )

        print(
            "APPLICATION FILLED SUCCESSFULLY!"
        )

        print(
            "======================================"
        )

        print(
            "\nReal Job Description was used."
        )

        print(
            "InternPilot STOPPED before Submit."
        )

        print(
            "Review everything manually."
        )

        print(
            "\nDO NOT AUTOMATICALLY SUBMIT."
        )

        print(
            "\nBrowser will remain open."
        )

        input(
            "\nPress ENTER to close the browser..."
        )

        browser.close()


# ============================================================
# RUN PROGRAM
# ============================================================

if __name__ == "__main__":

    main()

