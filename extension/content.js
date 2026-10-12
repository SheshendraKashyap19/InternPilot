// ============================================================
// INTERNPILOT AI - UNIVERSAL APPLICATION FORM ENGINE
// ============================================================

const RESUME_FILE_NAME =
    "24EG105V33_P.SHESHENDRAKASHYAP.pdf";


// ============================================================
// BASIC UTILITIES
// ============================================================

function cleanText(text) {

    if (!text) return "";

    return String(text)
        .replace(/\s+/g, " ")
        .trim();
}


function normalizeText(text) {

    return cleanText(text)
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/[^\w\s.@/]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function isVisible(element) {

    if (!element) return false;

    try {

        const style =
            window.getComputedStyle(element);

        const rect =
            element.getBoundingClientRect();

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0
        );

    } catch (error) {

        return false;

    }
}


// ============================================================
// LABEL DETECTION
// ============================================================

function findLabel(element) {

    if (!element) return "";

    // 1. label[for]

    if (element.id) {

        try {

            const label =
                document.querySelector(
                    `label[for="${CSS.escape(element.id)}"]`
                );

            if (label) {

                return cleanText(
                    label.innerText ||
                    label.textContent ||
                    ""
                );

            }

        } catch (error) {}

    }


    // 2. aria-label

    const ariaLabel =
        element.getAttribute("aria-label");

    if (ariaLabel) {

        return cleanText(ariaLabel);

    }


    // 3. aria-labelledby

    const labelledBy =
        element.getAttribute("aria-labelledby");

    if (labelledBy) {

        const text =
            labelledBy
                .split(/\s+/)
                .map(id => {

                    const node =
                        document.getElementById(id);

                    return node
                        ? cleanText(
                            node.innerText ||
                            node.textContent ||
                            ""
                        )
                        : "";

                })
                .filter(Boolean)
                .join(" ");

        if (text) return text;

    }


    // 4. autocomplete

    const autocomplete =
        element.getAttribute("autocomplete");

    if (autocomplete) {

        const auto =
            autocomplete.toLowerCase();

        if (auto === "given-name")
            return "First Name";

        if (auto === "family-name")
            return "Last Name";

        if (auto === "name")
            return "Full Name";

        if (auto === "email")
            return "Email";

        if (auto === "tel")
            return "Phone";
    }


    // 5. placeholder

    const placeholder =
        element.getAttribute("placeholder");

    if (placeholder) {

        return cleanText(placeholder);

    }


    // 6. previous sibling

    let previous =
        element.previousElementSibling;

    for (
        let i = 0;
        i < 3 && previous;
        i++
    ) {

        const text =
            cleanText(
                previous.innerText ||
                previous.textContent ||
                ""
            );

        if (
            text &&
            text.length <= 150
        ) {

            return text;

        }

        previous =
            previous.previousElementSibling;

    }


    // 7. parent children

    const parent =
        element.parentElement;

    if (parent) {

        const children =
            Array.from(parent.children);

        const index =
            children.indexOf(element);

        if (index > 0) {

            for (
                let i = index - 1;
                i >= 0;
                i--
            ) {

                const child =
                    children[i];

                const text =
                    cleanText(
                        child.innerText ||
                        child.textContent ||
                        ""
                    );

                if (
                    text &&
                    text.length <= 150
                ) {

                    return text;

                }

            }

        }

    }


    return "";

}


// ============================================================
// NEARBY TEXT
// ============================================================

function getNearbyText(element) {

    if (!element) return "";

    const pieces = [];

    if (element.parentElement) {

        pieces.push(
            element.parentElement.innerText ||
            element.parentElement.textContent ||
            ""
        );

    }

    if (
        element.parentElement &&
        element.parentElement.parentElement
    ) {

        pieces.push(
            element.parentElement.parentElement.innerText ||
            element.parentElement.parentElement.textContent ||
            ""
        );

    }

    return cleanText(
        pieces.join(" ")
    ).substring(0, 700);

}


// ============================================================
// ELEMENT CONTEXT
// ============================================================

function getElementContext(element) {

    return {

        tag:
            element.tagName
                ? element.tagName.toLowerCase()
                : "",

        type:
            element.type || "",

        id:
            element.id || "",

        name:
            element.getAttribute("name") || "",

        placeholder:
            element.getAttribute("placeholder") || "",

        ariaLabel:
            element.getAttribute("aria-label") || "",

        role:
            element.getAttribute("role") || "",

        autocomplete:
            element.getAttribute("autocomplete") || "",

        label:
            findLabel(element),

        nearbyText:
            getNearbyText(element),

        value:
            element.value || ""

    };

}


// ============================================================
// FIELD IDENTIFIER
// ============================================================

function getFieldIdentifier(element) {

    const context =
        getElementContext(element);

    return normalizeText(

        [
            context.label,
            context.placeholder,
            context.ariaLabel,
            context.name,
            context.id,
            context.autocomplete
        ]
            .filter(Boolean)
            .join(" ")

    );

}


// ============================================================
// SET FIELD VALUE
// ============================================================

function setFieldValue(
    element,
    value
) {

    if (!element) return false;

    const finalValue =
        String(value ?? "");

    try {

        // React / modern frameworks

        const prototype =
            element instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

        const descriptor =
            Object.getOwnPropertyDescriptor(
                prototype,
                "value"
            );

        if (
            descriptor &&
            descriptor.set
        ) {

            descriptor.set.call(
                element,
                finalValue
            );

        } else {

            element.value =
                finalValue;

        }


        element.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );

        element.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        element.dispatchEvent(
            new Event(
                "blur",
                {
                    bubbles: true
                }
            )
        );

        return true;

    } catch (error) {

        console.error(
            "[InternPilot] Could not set field:",
            error
        );

        return false;

    }

}


// ============================================================
// SELECT OPTION
// ============================================================

function selectOptionByText(
    select,
    value
) {

    if (!select) return false;

    const target =
        normalizeText(value);

    if (!target) return false;

    const options =
        Array.from(
            select.options || []
        );

    let bestOption = null;


    // Exact match

    for (const option of options) {

        const text =
            normalizeText(
                option.textContent ||
                option.innerText ||
                ""
            );

        const optionValue =
            normalizeText(
                option.value || ""
            );

        if (
            text === target ||
            optionValue === target
        ) {

            bestOption = option;
            break;

        }

    }


    // Partial match

    if (!bestOption) {

        for (const option of options) {

            const text =
                normalizeText(
                    option.textContent ||
                    option.innerText ||
                    ""
                );

            if (
                text.includes(target) ||
                target.includes(text)
            ) {

                if (text.length > 0) {

                    bestOption = option;
                    break;

                }

            }

        }

    }


    if (!bestOption) {

        console.log(
            "[InternPilot] Select option not found:",
            value
        );

        return false;

    }


    select.value =
        bestOption.value;

    select.dispatchEvent(
        new Event(
            "change",
            {
                bubbles: true
            }
        )
    );

    select.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );

    return true;

}


// ============================================================
// PROFILE VALUE
// ============================================================

function getProfileValue(
    type,
    profile
) {

    if (!profile) return "";

    const student =
        profile.student ||
        profile;

    const education =
        student.education ||
        profile.education ||
        {};


    switch (type) {

        case "FIRST_NAME": {

            const name =
                student.name ||
                profile.name ||
                "";

            return String(name)
                .trim()
                .split(/\s+/)[0] || "";

        }


        case "LAST_NAME": {

            const name =
                student.name ||
                profile.name ||
                "";

            const parts =
                String(name)
                    .trim()
                    .split(/\s+/);

            return parts.length > 1
                ? parts[parts.length - 1]
                : "";

        }


        case "FULL_NAME":

            return (
                student.name ||
                profile.name ||
                ""
            );


        case "EMAIL":

            return (
                student.email ||
                profile.email ||
                ""
            );


        case "PHONE":

            return (
                student.phone ||
                profile.phone ||
                ""
            );


        case "UNIVERSITY":

            return (
                education.university ||
                student.university ||
                profile.university ||
                ""
            );


        case "LOCATION":

            return (
                student.location ||
                profile.location ||
                ""
            );


        case "LINKEDIN":

            return (
                student.linkedin ||
                profile.linkedin ||
                ""
            );


        case "GITHUB":

            return (
                student.github ||
                profile.github ||
                ""
            );


        case "PORTFOLIO":

            return (
                student.portfolio ||
                profile.portfolio ||
                ""
            );


        case "CGPA":

            return (
                education.cgpa ||
                student.cgpa ||
                profile.cgpa ||
                ""
            );


        case "DEGREE":

            return (
                education.degree ||
                student.degree ||
                profile.degree ||
                ""
            );


        case "DISCIPLINE":

            return (
                education.branch ||
                student.branch ||
                profile.branch ||
                ""
            );


        case "GRADUATION_YEAR":

            return (
                education.graduationYear ||
                student.graduationYear ||
                profile.graduationYear ||
                ""
            );


        case "SKILLS":

            return (
                student.skills ||
                profile.skills ||
                []
            );


        default:

            return "";

    }

}


// ============================================================
// PROFILE FIELD CLASSIFICATION
// ============================================================

function classifyProfileField(element) {

    const context =
        getElementContext(element);

    const text =
        normalizeText(

            [
                context.label,
                context.placeholder,
                context.ariaLabel,
                context.name,
                context.id,
                context.autocomplete
            ]
                .filter(Boolean)
                .join(" ")

        );

    const inputType =
        String(
            context.type || ""
        ).toLowerCase();


    if (
        inputType === "email" ||
        text.includes("email")
    ) {

        return "EMAIL";

    }


    if (
        inputType === "tel" ||
        text.includes("phone") ||
        text.includes("mobile") ||
        text.includes("telephone") ||
        text.includes("contact number")
    ) {

        return "PHONE";

    }


    if (
        text.includes("first name") ||
        text.includes("firstname") ||
        text.includes("given name")
    ) {

        return "FIRST_NAME";

    }


    if (
        text.includes("last name") ||
        text.includes("lastname") ||
        text.includes("surname") ||
        text.includes("family name")
    ) {

        return "LAST_NAME";

    }


    if (
        text.includes("full name") ||
        text === "name" ||
        text.includes("candidate name") ||
        text.includes("applicant name")
    ) {

        return "FULL_NAME";

    }


    if (
        text.includes("linkedin")
    ) {

        return "LINKEDIN";

    }


    if (
        text.includes("github")
    ) {

        return "GITHUB";

    }


    if (
        text.includes("portfolio") ||
        text.includes("personal website")
    ) {

        return "PORTFOLIO";

    }


    if (
        text === "cgpa" ||
        text.includes("cgpa") ||
        text.includes("gpa")
    ) {

        return "CGPA";

    }


    if (
        text.includes("degree") ||
        text.includes("qualification")
    ) {

        return "DEGREE";

    }


    if (
        text.includes("branch") ||
        text.includes("discipline") ||
        text.includes("major") ||
        text.includes("field of study")
    ) {

        return "DISCIPLINE";

    }


    if (
        text.includes("university") ||
        text.includes("college") ||
        text.includes("institution")
    ) {

        return "UNIVERSITY";

    }


    if (
        text.includes("location") ||
        text.includes("current city") ||
        text === "city"
    ) {

        return "LOCATION";

    }


    if (
        text.includes("graduation year") ||
        text.includes("expected graduation")
    ) {

        return "GRADUATION_YEAR";

    }


    return "UNKNOWN";

}


// ============================================================
// FILL PROFILE
// ============================================================

function fillProfile(profile) {

    if (!profile) {

        return {
            filledCount: 0,
            fields: []
        };

    }


    const elements =
        Array.from(
            document.querySelectorAll(
                "input, textarea, select, [contenteditable='true']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    let filledCount = 0;

    const fields = [];


    for (const element of elements) {

        const type =
            String(
                element.type || ""
            ).toLowerCase();


        if (
            type === "hidden" ||
            type === "submit" ||
            type === "button" ||
            type === "reset" ||
            type === "checkbox" ||
            type === "radio" ||
            type === "file"
        ) {

            continue;

        }


        const semanticType =
            classifyProfileField(element);


        if (
            semanticType === "UNKNOWN"
        ) {

            continue;

        }


        const value =
            getProfileValue(
                semanticType,
                profile
            );


        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            continue;

        }


        // Skills handled separately

        if (
            semanticType === "SKILLS"
        ) {

            continue;

        }


        let success = false;


        if (
            element.tagName.toLowerCase() ===
            "select"
        ) {

            success =
                selectOptionByText(
                    element,
                    value
                );

        }

        else if (
            element.isContentEditable
        ) {

            element.innerText =
                String(value);

            element.dispatchEvent(
                new InputEvent(
                    "input",
                    {
                        bubbles: true,
                        inputType: "insertText",
                        data: String(value)
                    }
                )
            );

            success = true;

        }

        else {

            success =
                setFieldValue(
                    element,
                    value
                );

        }


        if (success) {

            filledCount++;

            fields.push({

                type:
                semanticType,

                value:
                    String(value)

            });

            console.log(
                "[InternPilot] Filled:",
                semanticType
            );

        }

    }


    fillSkills(profile);


    return {

        filledCount,

        fields

    };

}


// ============================================================
// SKILLS
// ============================================================

function fillSkills(profile) {

    const skills =
        getProfileValue(
            "SKILLS",
            profile
        );


    if (
        !Array.isArray(skills) ||
        skills.length === 0
    ) {

        return;

    }


    const elements =
        Array.from(
            document.querySelectorAll(
                "input, textarea"
            )
        )
            .filter(
                element => isVisible(element)
            );


    let skillInput = null;


    for (const element of elements) {

        const identifier =
            getFieldIdentifier(element);


        if (
            identifier.includes("skills") ||
            identifier.includes("technical skills") ||
            identifier.includes("programming skills") ||
            identifier.includes("technologies") ||
            identifier.includes("tech stack")
        ) {

            skillInput = element;
            break;

        }

    }


    if (!skillInput) {

        return;

    }


    let index = 0;


    function addNextSkill() {

        if (
            index >= skills.length
        ) {

            console.log(
                "[InternPilot] Finished adding skills."
            );

            return;

        }


        const skill =
            String(
                skills[index] || ""
            ).trim();


        index++;


        if (!skill) {

            addNextSkill();
            return;

        }


        setFieldValue(
            skillInput,
            skill
        );


        skillInput.dispatchEvent(
            new KeyboardEvent(
                "keydown",
                {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                }
            )
        );


        skillInput.dispatchEvent(
            new KeyboardEvent(
                "keyup",
                {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                }
            )
        );


        setTimeout(
            addNextSkill,
            300
        );

    }


    addNextSkill();

}


// ============================================================
// APPLICATION QUESTION CLASSIFIER
// ============================================================

function classifyApplicationQuestion(element) {

    if (!element) {

        return {
            type: "UNKNOWN",
            confidence: 0
        };

    }


    const context =
        getElementContext(element);


    const text =
        normalizeText(

            [
                context.label,
                context.placeholder,
                context.ariaLabel,
                context.name,
                context.id,
                context.nearbyText
            ]
                .filter(Boolean)
                .join(" ")

        );


    // ========================================================
    // WHERE DID YOU HEAR ABOUT US?
    // ========================================================

    if (
        text.includes("where did you hear") ||
        text.includes("how did you hear") ||
        text.includes("how did you learn about") ||
        text.includes("how did you find us") ||
        text.includes("where did you find us") ||
        text.includes("source of application")
    ) {

        return {

            type: "SAFE",
            questionType: "SOURCE",
            confidence: 0.98

        };

    }


    // ========================================================
    // COVER LETTER
    // ========================================================

    if (
        text.includes("cover letter") ||
        text.includes("coverletter") ||
        text.includes("covering letter") ||
        text.includes("letter of motivation")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "COVER_LETTER",
            confidence: 0.99

        };

    }


    // ========================================================
    // WHY INTERESTED
    // ========================================================

    if (
        text.includes("why are you interested") ||
        text.includes("why this internship") ||
        text.includes("why this role") ||
        text.includes("why do you want this internship") ||
        text.includes("why do you want this role") ||
        text.includes("what interests you") ||
        text.includes("motivation for applying")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "WHY_INTERESTED",
            confidence: 0.97

        };

    }


    // ========================================================
    // WHY HIRE
    // ========================================================

    if (
        text.includes("why should we hire") ||
        text.includes("why are you a good fit") ||
        text.includes("why are you suitable") ||
        text.includes("why are you a fit") ||
        text.includes("why should we select") ||
        text.includes("what makes you a good candidate")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "WHY_HIRE",
            confidence: 0.97

        };

    }


    // ========================================================
    // TELL ME ABOUT YOURSELF
    // ========================================================

    if (
        text.includes("tell me about yourself") ||
        text.includes("about yourself") ||
        text.includes("introduce yourself") ||
        text.includes("describe yourself")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "ABOUT",
            confidence: 0.97

        };

    }


    // ========================================================
    // PROJECT
    // ========================================================

    if (
        text.includes("describe your project") ||
        text.includes("describe a project") ||
        text.includes("relevant project") ||
        text.includes("project experience") ||
        text.includes("technical project")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "PROJECT",
            confidence: 0.95

        };

    }


    // ========================================================
    // EXPERIENCE
    // ========================================================

    if (
        text.includes("describe your experience") ||
        text.includes("relevant experience") ||
        text.includes("internship experience") ||
        text.includes("previous internship") ||
        text.includes("prior internship")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "EXPERIENCE",
            confidence: 0.95

        };

    }


    // ========================================================
    // ADDITIONAL INFORMATION
    // ========================================================

    if (
        text.includes("additional information") ||
        text.includes("additional comments") ||
        text.includes("anything else") ||
        text.includes("other information") ||
        text.includes("additional details")
    ) {

        return {

            type: "AI_GENERATED",
            questionType: "ADDITIONAL_INFO",
            confidence: 0.90

        };

    }


    // ========================================================
    // PERSONAL / SENSITIVE QUESTIONS
    // DO NOT GUESS
    // ========================================================

    if (
        text.includes("visa sponsorship") ||
        text.includes("require sponsorship") ||
        text.includes("need sponsorship") ||
        text.includes("work authorization") ||
        text.includes("authorized to work") ||
        text.includes("legally authorized") ||
        text.includes("salary expectation") ||
        text.includes("expected salary") ||
        text.includes("salary requirements") ||
        text.includes("willing to relocate") ||
        text.includes("relocation")
    ) {

        return {

            type: "REVIEW_REQUIRED",
            confidence: 0.98

        };

    }


    return {

        type: "UNKNOWN",
        confidence: 0

    };

}


// ============================================================
// SCAN APPLICATION QUESTIONS
// ============================================================

function scanApplicationQuestions() {

    const elements =
        Array.from(
            document.querySelectorAll(
                "input, textarea, select, [contenteditable='true']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    const result = {

        safeQuestions: [],

        aiQuestions: [],

        reviewRequired: []

    };


    for (const element of elements) {

        const inputType =
            String(
                element.type || ""
            ).toLowerCase();


        if (
            inputType === "hidden" ||
            inputType === "submit" ||
            inputType === "button" ||
            inputType === "reset"
        ) {

            continue;

        }


        const classification =
            classifyApplicationQuestion(
                element
            );


        const context =
            getElementContext(element);


        if (
            classification.type === "SAFE"
        ) {

            result.safeQuestions.push({

                element,
                context,
                questionType:
                classification.questionType

            });

        }


        else if (
            classification.type ===
            "AI_GENERATED"
        ) {

            result.aiQuestions.push({

                element,
                context,
                questionType:
                classification.questionType

            });

        }


        else if (
            classification.type ===
            "REVIEW_REQUIRED"
        ) {

            result.reviewRequired.push({

                context,

                reason:
                    "Manual confirmation required."

            });

        }

    }


    return result;

}


// ============================================================
// FILL SAFE APPLICATION QUESTIONS
// ============================================================

function fillSafeApplicationQuestions() {

    const result =
        scanApplicationQuestions();


    let filledCount = 0;


    for (
        const item
        of result.safeQuestions
        ) {

        const element =
            item.element;


        // ================================================
        // DEFAULT:
        // WHERE DID YOU HEAR ABOUT US?
        // ================================================

        if (
            item.questionType ===
            "SOURCE"
        ) {

            const answer =
                "LinkedIn";


            if (
                element.tagName.toLowerCase() ===
                "select"
            ) {

                if (
                    selectOptionByText(
                        element,
                        answer
                    )
                ) {

                    filledCount++;

                    console.log(
                        "[InternPilot] Where did you hear about us:",
                        answer
                    );

                }

            }

            else {

                if (
                    setFieldValue(
                        element,
                        answer
                    )
                ) {

                    filledCount++;

                    console.log(
                        "[InternPilot] Where did you hear about us:",
                        answer
                    );

                }

            }

        }

    }


    return {

        filledCount,

        aiQuestions:
            result.aiQuestions.map(
                item => ({

                    context:
                    item.context,

                    questionType:
                    item.questionType

                })
            ),

        reviewRequired:
        result.reviewRequired

    };

}


// ============================================================
// FIND MATCHING FIELD
// ============================================================

function findMatchingField(fieldData) {

    if (!fieldData) return null;


    const elements =
        Array.from(
            document.querySelectorAll(
                "input, textarea, select, [contenteditable='true']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    if (typeof fieldData === "string") {

        const target =
            normalizeText(fieldData);


        // Exact identifier match

        for (const element of elements) {

            const identifier =
                getFieldIdentifier(element);

            if (
                identifier === target
            ) {

                return element;

            }

        }


        // Partial match

        for (const element of elements) {

            const identifier =
                getFieldIdentifier(element);

            if (
                identifier.includes(target) ||
                target.includes(identifier)
            ) {

                return element;

            }

        }

    }


    // Object-based matching

    if (
        typeof fieldData === "object"
    ) {

        let bestElement = null;
        let bestScore = 0;


        for (const element of elements) {

            const context =
                getElementContext(element);


            let score = 0;


            if (
                fieldData.id &&
                context.id === fieldData.id
            ) {

                score += 50;

            }


            if (
                fieldData.name &&
                context.name === fieldData.name
            ) {

                score += 40;

            }


            if (
                fieldData.label &&
                normalizeText(
                    context.label
                ) === normalizeText(
                    fieldData.label
                )
            ) {

                score += 40;

            }


            if (
                fieldData.placeholder &&
                normalizeText(
                    context.placeholder
                ) === normalizeText(
                    fieldData.placeholder
                )
            ) {

                score += 30;

            }


            if (
                fieldData.tag &&
                context.tag === fieldData.tag
            ) {

                score += 10;

            }


            if (
                fieldData.type &&
                context.type === fieldData.type
            ) {

                score += 10;

            }


            if (
                score > bestScore
            ) {

                bestScore = score;
                bestElement = element;

            }

        }


        return bestElement;

    }


    return null;

}


// ============================================================
// FILL AI ANSWERS
// ============================================================

function fillAnswers(answers) {

    // First fill safe questions

    const safeResult =
        fillSafeApplicationQuestions();


    let filledCount =
        safeResult.filledCount || 0;


    // If AI answers are not available yet,
    // return detected questions.

    if (
        !Array.isArray(answers)
    ) {

        return {

            filledCount,

            aiQuestions:
            safeResult.aiQuestions,

            reviewRequired:
            safeResult.reviewRequired

        };

    }


    // Fill AI-generated answers

    for (
        const item
        of answers
        ) {

        if (!item) continue;


        const field =
            findMatchingField(
                item.field
            );


        if (!field) {

            console.log(
                "[InternPilot] AI field not found:",
                item.field
            );

            continue;

        }


        const answer =
            String(
                item.answer || ""
            );


        if (
            !answer.trim()
        ) {

            continue;

        }


        let success = false;


        if (
            field.isContentEditable
        ) {

            field.innerText =
                answer;


            field.dispatchEvent(
                new InputEvent(
                    "input",
                    {
                        bubbles: true,
                        inputType:
                            "insertText",
                        data:
                        answer
                    }
                )
            );


            field.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );


            success = true;

        }

        else if (
            field.tagName.toLowerCase() ===
            "select"
        ) {

            success =
                selectOptionByText(
                    field,
                    answer
                );

        }

        else {

            success =
                setFieldValue(
                    field,
                    answer
                );

        }


        if (success) {

            filledCount++;

            console.log(
                "[InternPilot] AI answer filled:",
                item.field
            );

        }

    }


    return {

        filledCount,

        aiQuestions:
        safeResult.aiQuestions,

        reviewRequired:
        safeResult.reviewRequired

    };

}


// ============================================================
// RESUME UPLOAD
// ============================================================

function getResumeUploadInfo() {

    const fileInputs =
        Array.from(
            document.querySelectorAll(
                "input[type='file']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    if (
        fileInputs.length === 0
    ) {

        return {

            found: false,

            count: 0

        };

    }


    return {

        found: true,

        count:
        fileInputs.length

    };

}


// ============================================================
// BASE64 TO FILE
// ============================================================

function base64ToFile(
    base64,
    fileName,
    mimeType
) {

    const binaryString =
        atob(base64);


    const length =
        binaryString.length;


    const bytes =
        new Uint8Array(length);


    for (
        let i = 0;
        i < length;
        i++
    ) {

        bytes[i] =
            binaryString.charCodeAt(i);

    }


    return new File(
        [bytes],
        fileName,
        {
            type:
                mimeType ||
                "application/pdf"
        }
    );

}


// ============================================================
// UPLOAD RESUME
// ============================================================

async function uploadResumeFile(
    fileData,
    fileName,
    mimeType
) {

    if (!fileData) {

        return {

            success: false,

            message:
                "No resume data received."

        };

    }


    const fileInputs =
        Array.from(
            document.querySelectorAll(
                "input[type='file']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    if (
        fileInputs.length === 0
    ) {

        return {

            success: false,

            message:
                "Resume upload field not found."

        };

    }


    const file =
        base64ToFile(
            fileData,
            fileName ||
            RESUME_FILE_NAME,
            mimeType ||
            "application/pdf"
        );


    try {

        const dataTransfer =
            new DataTransfer();


        dataTransfer.items.add(file);


        const input =
            fileInputs[0];


        input.files =
            dataTransfer.files;


        input.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );


        input.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );


        console.log(
            "[InternPilot] Resume uploaded:",
            file.name
        );


        return {

            success: true,

            message:
                "Resume uploaded successfully.",

            fileName:
            file.name

        };

    }

    catch (error) {

        console.error(
            "[InternPilot] Resume upload failed:",
            error
        );


        return {

            success: false,

            message:
            error.message

        };

    }

}


// ============================================================
// FIND SUBMIT BUTTON
// ============================================================

function findSubmitButton() {

    const buttons =
        Array.from(
            document.querySelectorAll(
                "button, input[type='submit'], [role='button']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    const submitWords = [

        "submit application",

        "submit",

        "apply now",

        "send application",

        "finish application",

        "complete application"

    ];


    for (const button of buttons) {

        const text =
            normalizeText(

                button.innerText ||
                button.value ||
                button.getAttribute(
                    "aria-label"
                ) ||
                ""

            );


        for (
            const word
            of submitWords
            ) {

            if (
                text ===
                normalizeText(word)
            ) {

                return button;

            }

        }

    }


    return null;

}


// ============================================================
// FIND NEXT BUTTON
// ============================================================

function findNextButton() {

    const buttons =
        Array.from(
            document.querySelectorAll(
                "button, input[type='button'], [role='button']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    const nextWords = [

        "next",

        "continue",

        "save and continue",

        "continue application",

        "proceed",

        "next step",

        "save & continue"

    ];


    for (const button of buttons) {

        const text =
            normalizeText(

                button.innerText ||
                button.value ||
                button.getAttribute(
                    "aria-label"
                ) ||
                ""

            );


        for (
            const word
            of nextWords
            ) {

            if (
                text ===
                normalizeText(word)
            ) {

                return button;

            }

        }

    }


    return null;

}


// ============================================================
// CHECK SUBMIT
// ============================================================

function checkSubmit() {

    const submit =
        findSubmitButton();


    return {

        visible:
            !!submit,

        text:
            submit
                ? cleanText(

                    submit.innerText ||
                    submit.value ||
                    submit.getAttribute(
                        "aria-label"
                    ) ||
                    ""

                )
                : ""

    };

}


// ============================================================
// CLICK NEXT
// ============================================================

function clickNext() {

    const next =
        findNextButton();


    if (!next) {

        return {

            clicked: false,

            text: ""

        };

    }


    const text =
        cleanText(

            next.innerText ||
            next.value ||
            next.getAttribute(
                "aria-label"
            ) ||
            ""

        );


    next.click();


    console.log(
        "[InternPilot] Clicked Next:",
        text
    );


    return {

        clicked: true,

        text

    };

}

function detectApplicationQuestions() {
    const questions = [];

    // Greenhouse application questions are commonly associated
    // with labels, legends, textareas, and input fields.
    const fields = document.querySelectorAll(
        'textarea, input[type="text"], input[type="url"], input[type="email"]'
    );

    fields.forEach((field, index) => {
        // Ignore hidden fields
        if (field.offsetParent === null) {
            return;
        }

        let question = "";

        // Try to find an associated label
        if (field.id) {
            const label = document.querySelector(
                `label[for="${CSS.escape(field.id)}"]`
            );

            if (label) {
                question = label.innerText.trim();
            }
        }

        // Try closest label
        if (!question) {
            const parentLabel = field.closest("label");

            if (parentLabel) {
                question = parentLabel.innerText.trim();
            }
        }

        // Try previous nearby text
        if (!question) {
            const container = field.closest(
                ".field, .application-question, .input, .select"
            );

            if (container) {
                const textElement = container.querySelector(
                    "label, legend, .label"
                );

                if (textElement) {
                    question = textElement.innerText.trim();
                }
            }
        }

        if (question) {
            questions.push({
                index,
                question,
                fieldType: field.tagName.toLowerCase(),
                inputType: field.type || null
            });
        }
    });

    return questions;
}
// ============================================================
// PAGE ANALYSIS
// ============================================================

function analyzePage() {

    const elements =
        Array.from(
            document.querySelectorAll(
                "input, textarea, select, button, [role='button'], [role='radio'], [contenteditable='true']"
            )
        )
            .filter(
                element => isVisible(element)
            );


    const fields = [];


    for (
        let index = 0;
        index < elements.length;
        index++
    ) {

        const element =
            elements[index];


        const context =
            getElementContext(element);


        const profileType =
            classifyProfileField(element);


        const applicationType =
            classifyApplicationQuestion(element);


        fields.push({

            index:
                index + 1,

            tag:
            context.tag,

            type:
            context.type,

            id:
            context.id,

            name:
            context.name,

            label:
            context.label,

            placeholder:
            context.placeholder,

            ariaLabel:
            context.ariaLabel,

            profileType,

            applicationType:
            applicationType.type,

            questionType:
                applicationType.questionType ||
                null
            const questions = detectApplicationQuestions();

            console.log("InternPilot detected questions:", questions);

        });

    }


    const submit =
        findSubmitButton();


    const next =
        findNextButton();


    const questionScan =
        scanApplicationQuestions();


    console.log(
        "[InternPilot] Page analysis:",
        fields
    );


    return {

        success: true,

        fieldCount:
        fields.length,

        fields,

        aiQuestions:
            questionScan.aiQuestions.map(
                item => ({

                    questionType:
                    item.questionType,

                    context:
                    item.context

                })
            ),

        reviewRequired:
        questionScan.reviewRequired,

        submitVisible:
            !!submit,

        submitText:
            submit
                ? cleanText(
                    submit.innerText ||
                    submit.value ||
                    submit.getAttribute(
                        "aria-label"
                    ) ||
                    ""
                )
                : "",

        nextVisible:
            !!next,

        nextText:
            next
                ? cleanText(
                    next.innerText ||
                    next.value ||
                    next.getAttribute(
                        "aria-label"
                    ) ||
                    ""
                )
                : ""

    };

}


// ============================================================
// FILL PREFERENCES
// ============================================================

function normalizeWorkMode(
    workMode
) {

    if (!workMode) return "";

    const value =
        normalizeText(workMode);


    if (
        value === "remote"
    ) {

        return "Remote";

    }


    if (
        value === "hybrid"
    ) {

        return "Hybrid";

    }


    if (
        value === "on site" ||
        value === "onsite"
    ) {

        return "On-site";

    }


    return workMode;

}


function findOptionByText(
    optionText
) {

    const target =
        normalizeText(optionText);


    if (!target) return null;


    const candidates =
        document.querySelectorAll(

            [
                "button",
                "[role='button']",
                "[role='radio']",
                "[role='option']",
                "label"
            ].join(",")

        );


    for (
        const element
        of candidates
        ) {

        if (
            !isVisible(element)
        ) {

            continue;

        }


        const text =
            normalizeText(

                element.innerText ||
                element.textContent ||
                element.getAttribute(
                    "aria-label"
                ) ||
                ""

            );


        if (
            text === target
        ) {

            return element;

        }

    }


    return null;

}


function clickOption(
    optionText
) {

    const element =
        findOptionByText(
            optionText
        );


    if (!element) {

        return false;

    }


    element.click();

    return true;

}


function fillPreferences(
    previousInternship,
    workMode
) {

    let filledCount = 0;


    if (
        previousInternship
    ) {

        const selects =
            Array.from(
                document.querySelectorAll(
                    "select"
                )
            )
                .filter(
                    element => isVisible(element)
                );


        for (
            const select
            of selects
            ) {

            const identifier =
                getFieldIdentifier(
                    select
                );


            if (
                identifier.includes(
                    "internship"
                ) ||
                identifier.includes(
                    "previous experience"
                )
            ) {

                if (
                    selectOptionByText(
                        select,
                        previousInternship
                    )
                ) {

                    filledCount++;

                }

                break;

            }

        }

    }


    const normalizedMode =
        normalizeWorkMode(
            workMode
        );


    if (
        normalizedMode
    ) {

        if (
            clickOption(
                normalizedMode
            )
        ) {

            filledCount++;

        }


        const radios =
            Array.from(
                document.querySelectorAll(
                    "input[type='radio']"
                )
            )
                .filter(
                    element => isVisible(element)
                );


        for (
            const radio
            of radios
            ) {

            const label =
                normalizeText(
                    findLabel(radio)
                );


            if (
                label ===
                normalizeText(
                    normalizedMode
                )
            ) {

                radio.click();

                filledCount++;

                break;

            }

        }

    }


    return {

        filledCount

    };

}


// ============================================================
// MESSAGE LISTENER
// ============================================================

chrome.runtime.onMessage.addListener(

    (
        message,
        sender,
        sendResponse
    ) => {

        try {


            // ==================================================
            // ANALYZE PAGE
            // ==================================================

            if (
                message.action ===
                "analyzePage"
            ) {

                sendResponse(
                    analyzePage()
                );

                return true;

            }


            // ==================================================
            // FILL PROFILE
            // ==================================================

            if (
                message.action ===
                "fillProfile"
            ) {

                sendResponse(
                    fillProfile(
                        message.profile
                    )
                );

                return true;

            }


            // ==================================================
            // FILL PREFERENCES
            // ==================================================

            if (
                message.action ===
                "fillPreferences"
            ) {

                sendResponse(
                    fillPreferences(
                        message.previousInternship,
                        message.workMode
                    )
                );

                return true;

            }


            // ==================================================
            // SCAN QUESTIONS
            // ==================================================

            if (
                message.action ===
                "scanApplicationQuestions"
            ) {

                sendResponse(
                    scanApplicationQuestions()
                );

                return true;

            }


            // ==================================================
            // FILL AI ANSWERS
            // ==================================================

            if (
                message.action ===
                "fillAnswers"
            ) {

                sendResponse(
                    fillAnswers(
                        message.answers
                    )
                );

                return true;

            }


            // ==================================================
            // CHECK RESUME UPLOAD
            // ==================================================

            if (
                message.action ===
                "checkResumeUpload"
            ) {

                sendResponse(
                    getResumeUploadInfo()
                );

                return true;

            }


            // ==================================================
            // UPLOAD RESUME
            // ==================================================

            if (
                message.action ===
                "uploadResume"
            ) {

                uploadResumeFile(

                    message.fileData,

                    message.fileName ||
                    RESUME_FILE_NAME,

                    message.mimeType ||
                    "application/pdf"

                )
                    .then(
                        result => {

                            sendResponse(
                                result
                            );

                        }
                    )
                    .catch(
                        error => {

                            sendResponse({

                                success: false,

                                message:
                                error.message

                            });

                        }
                    );


                return true;

            }


            // ==================================================
            // CHECK SUBMIT
            // ==================================================

            if (
                message.action ===
                "checkSubmit"
            ) {

                sendResponse(
                    checkSubmit()
                );

                return true;

            }


            // ==================================================
            // CLICK NEXT
            // ==================================================

            if (
                message.action ===
                "clickNext"
            ) {

                sendResponse(
                    clickNext()
                );

                return true;

            }


            return false;

        }

        catch (error) {

            console.error(
                "[InternPilot] Message error:",
                error
            );


            sendResponse({

                success: false,

                error:
                error.message

            });


            return true;

        }

    }

);


// ============================================================
// READY
// ============================================================

console.log(
    "[InternPilot] Universal Application Form Engine loaded."
);

console.log(
    "[InternPilot] Profile autofill + question detection + resume upload ready."
);