// ============================================================
// INTERNPILOT POPUP
// ============================================================

const SPRING_BOOT_URL =
    "http://localhost:8080";

const AI_SERVICE_URL =
    "http://127.0.0.1:8000";


// ============================================================
// DOM
// ============================================================

const analyzeButton =
    document.getElementById("analyzeButton");

const autofillButton =
    document.getElementById("autofillButton");

const status =
    document.getElementById("status");

const result =
    document.getElementById("result");

const resumeFile =
    document.getElementById("resumeFile");

const workMode =
    document.getElementById("workMode");

const previousInternship =
    document.getElementById("previousInternship");


// ============================================================
// GLOBAL STATE
// ============================================================

let currentTab = null;

let pageAnalysis = null;


// ============================================================
// WAIT
// ============================================================

function wait(milliseconds) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            milliseconds
        );

    });

}


// ============================================================
// GET ACTIVE TAB
// ============================================================

async function getActiveTab() {

    const tabs =
        await chrome.tabs.query({
            active: true,
            currentWindow: true
        });


    if (
        !tabs ||
        tabs.length === 0
    ) {

        throw new Error(
            "No active browser tab found."
        );

    }


    return tabs[0];

}


// ============================================================
// READ FILE AS BASE64
// ============================================================

function readFileAsBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                const fileResult =
                    reader.result;


                const base64 =
                    String(fileResult)
                        .split(",")[1];


                resolve({

                    name:
                        file.name,

                    type:
                        file.type,

                    base64:
                        base64

                });

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Could not read resume file."
                    )
                );

            };


            reader.readAsDataURL(file);

        }
    );

}


// ============================================================
// ANALYZE BUTTON
// ============================================================

analyzeButton.addEventListener(
    "click",
    async () => {

        try {

            status.innerText =
                "Analyzing application page...";


            currentTab =
                await getActiveTab();


            pageAnalysis =
                await chrome.tabs.sendMessage(
                    currentTab.id,
                    {
                        action:
                            "analyzePage"
                    }
                );


            console.log(
                "InternPilot page analysis:",
                pageAnalysis
            );


            const fields =
                pageAnalysis.fields || [];


            result.innerHTML =
                `
                <strong>Application detected</strong>
                <br>
                Fields found: ${fields.length}
                `;


            autofillButton.disabled =
                false;


            status.innerText =
                "Page analyzed successfully.";

        }
        catch (error) {

            console.error(
                "Analysis error:",
                error
            );


            status.innerText =
                "Analysis failed.";


            result.innerText =
                error.message;

        }

    }
);


// ============================================================
// AUTOFILL BUTTON
// ============================================================

autofillButton.addEventListener(
    "click",
    async () => {

        try {

            autofillButton.disabled =
                true;


            status.innerText =
                "Starting InternPilot...";


            await runMultiStepApplication();

        }
        catch (error) {

            console.error(
                "InternPilot error:",
                error
            );


            status.innerText =
                "Error occurred.";


            result.innerText =
                error.message;


            autofillButton.disabled =
                false;

        }

    }
);


// ============================================================
// MAIN APPLICATION PROCESS
// ============================================================

async function runMultiStepApplication() {

    currentTab =
        await getActiveTab();


    // ========================================================
    // RESUME
    // ========================================================

    let selectedResume = null;


    if (
        resumeFile &&
        resumeFile.files &&
        resumeFile.files.length > 0
    ) {

        selectedResume =
            await readFileAsBase64(
                resumeFile.files[0]
            );


        console.log(
            "Resume selected:",
            selectedResume.name
        );

    }
    else {

        console.log(
            "No resume selected in popup."
        );

    }


    // ========================================================
    // GET RESUME PROFILE
    // ========================================================

    status.innerText =
        "Getting resume profile...";


    const profileResponse =
        await fetch(
            `${SPRING_BOOT_URL}/api/resume/parse?fileName=24EG105V33_P.SHESHENDRAKASHYAP.pdf`
        );


    if (!profileResponse.ok) {

        throw new Error(
            "Could not get resume profile from Spring Boot."
        );

    }


    const profile =
        await profileResponse.json();


    console.log(
        "Resume profile:",
        profile
    );


    // ========================================================
    // PROCESS MAXIMUM 5 STEPS
    // ========================================================

    for (
        let step = 1;
        step <= 5;
        step++
    ) {

        console.log(
            "===================================="
        );


        console.log(
            "InternPilot processing Step:",
            step
        );


        status.innerText =
            `Processing application step ${step}...`;


        // ====================================================
        // ANALYZE CURRENT PAGE
        // ====================================================

        const analysis =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "analyzePage"
                }
            );


        console.log(
            "Current page analysis:",
            analysis
        );


        // ====================================================
        // RESUME UPLOAD
        // ====================================================

        if (selectedResume) {

            const uploadInfo =
                await chrome.tabs.sendMessage(
                    currentTab.id,
                    {
                        action:
                            "checkResumeUpload"
                    }
                );


            if (
                uploadInfo &&
                uploadInfo.found
            ) {

                status.innerText =
                    "Uploading resume...";


                const uploadResult =
                    await chrome.tabs.sendMessage(
                        currentTab.id,
                        {
                            action:
                                "uploadResume",

                            fileData:
                                selectedResume
                        }
                    );


                console.log(
                    "Resume upload result:",
                    uploadResult
                );


                if (
                    uploadResult &&
                    uploadResult.success
                ) {

                    console.log(
                        "✅ Resume uploaded."
                    );

                }
                else {

                    console.warn(
                        "⚠️ Resume upload failed:",
                        uploadResult
                    );

                }

            }

        }


        // ====================================================
        // FILL PROFILE
        // ====================================================

        status.innerText =
            `Filling profile — Step ${step}...`;


        const profileResult =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "fillProfile",

                    profile:
                        profile
                }
            );


        console.log(
            "Profile fill result:",
            profileResult
        );


        // ====================================================
        // FILL PREFERENCES
        // ====================================================

        const preferenceResult =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "fillPreferences",

                    previousInternship:
                        previousInternship
                            ? previousInternship.value
                            : "",

                    workMode:
                        workMode
                            ? workMode.value
                            : ""
                }
            );


        console.log(
            "Preference fill result:",
            preferenceResult
        );


        // ====================================================
        // ANALYZE AGAIN
        // ====================================================

        const currentAnalysis =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "analyzePage"
                }
            );


        console.log(
            "Updated page analysis:",
            currentAnalysis
        );


        // ====================================================
        // AI QUESTIONS
        // ====================================================

        const questionFields =
            getQuestionFields(
                currentAnalysis.fields
            );


        console.log(
            "🤖 AI question fields:",
            questionFields
        );


        // ====================================================
        // PROCESS EACH AI QUESTION
        // ====================================================

        for (
            const field
            of questionFields
        ) {

            const question =
                getQuestionText(field);


            if (!question) {

                console.warn(
                    "⚠️ Could not determine question:",
                    field
                );

                continue;

            }


            console.log(
                "📝 Processing question:",
                question
            );


            status.innerText =
                `Generating answer: ${question}`;


            try {

                // ============================================
                // CALL AI SERVICE
                // ============================================

                const response =
                    await fetch(
                        `${AI_SERVICE_URL}/tailor`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    fileName:
                                        "24EG105V33_P.SHESHENDRAKASHYAP.pdf",

                                    jobDescription:
                                        currentAnalysis
                                            .jobDescription || "",

                                    question:
                                        question

                                })

                        }
                    );


                // ============================================
                // CHECK AI RESPONSE
                // ============================================

                if (!response.ok) {

                    console.warn(
                        "⚠️ AI service failed:",
                        response.status,
                        question
                    );

                    continue;

                }


                // ============================================
                // READ AI RESPONSE
                // ============================================

                const data =
                    await response.json();


                console.log(
                    "🤖 AI response:",
                    data
                );


                // ============================================
                // GET ANSWER
                // ============================================

                const answer =
                    data.answer ||
                    data.whyHire ||
                    "";


                if (
                    !answer ||
                    !answer.trim()
                ) {

                    console.warn(
                        "⚠️ AI returned no answer:",
                        question
                    );

                    continue;

                }


                console.log(
                    "✅ Generated answer:",
                    answer
                );


                // ============================================
                // FILL ANSWER INTO PAGE
                // ============================================

                const fillResult =
                    await chrome.tabs.sendMessage(
                        currentTab.id,
                        {
                            action:
                                "fillAnswers",

                            answers: [

                                {
                                    field:
                                        field,

                                    answer:
                                        answer
                                }

                            ]

                        }
                    );


                console.log(
                    "✍️ Answer fill result:",
                    fillResult
                );


                await wait(500);

            }
            catch (error) {

                console.error(
                    "❌ AI question error:",
                    question,
                    error
                );

            }

        }


        // ====================================================
        // CHECK SUBMIT BUTTON
        // ====================================================

        const submitResult =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "checkSubmit"
                }
            );


        if (
            submitResult &&
            submitResult.visible
        ) {

            console.log(
                "🛑 Submit button detected."
            );


            status.innerText =
                "🛑 Final step reached. Review manually.";


            result.innerHTML =
                `
                <strong>Application filled successfully.</strong>
                <br><br>
                🛑 InternPilot stopped before Submit.
                <br>
                Please review everything manually.
                `;


            return;

        }


        // ====================================================
        // FIND NEXT / CONTINUE
        // ====================================================

        status.innerText =
            "Looking for Next / Continue...";


        const nextResult =
            await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    action:
                        "clickNext"
                }
            );


        if (
            !nextResult ||
            !nextResult.clicked
        ) {

            console.log(
                "No Next/Continue button found."
            );


            status.innerText =
                "Application filled. Review manually.";


            result.innerHTML =
                `
                <strong>Application processing finished.</strong>
                <br><br>
                Please review manually before submitting.
                `;


            return;

        }


        console.log(
            "➡️ Next/Continue clicked."
        );


        status.innerText =
            "Waiting for next step...";


        await wait(1500);

    }

}


// ============================================================
// GET QUESTION TEXT
// ============================================================

function getQuestionText(field) {

    if (!field) {
        return "";
    }


    // Prefer actual visible question/label
    const candidates = [

        field.label,

        field.question,

        field.questionText,

        field.ariaLabel,

        field.placeholder

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate &&
            String(candidate).trim()
        ) {

            const text =
                String(candidate).trim();


            const normalized =
                text.toLowerCase();


            // Ignore generic placeholders
            if (
                normalized === "answer" ||
                normalized === "your answer" ||
                normalized === "enter your answer" ||
                normalized === "response" ||
                normalized === "enter response"
            ) {

                continue;

            }


            return text;

        }

    }


    // Name as last resort
    if (
        field.name &&
        !/^question[_-]?\d+$/i.test(
            field.name
        )
    ) {

        return field.name;

    }


    // ID as last resort
    if (
        field.id &&
        !/^question[_-]?\d+$/i.test(
            field.id
        )
    ) {

        return field.id;

    }


    return "";

}


// ============================================================
// GET AI QUESTION FIELDS
// ============================================================

function getQuestionFields(fields) {

    if (!Array.isArray(fields)) {

        return [];

    }


    return fields.filter(field => {

        if (!field) {

            return false;

        }


        const type =
            String(
                field.type || ""
            ).toLowerCase();


        // Ignore non-text elements
        if (
            type === "file" ||
            type === "radio" ||
            type === "checkbox" ||
            type === "button" ||
            type === "submit"
        ) {

            return false;

        }


        // IMPORTANT:
        // content.js sends semanticType,
        // not classification.
        return (
            field.semanticType ===
            "AI_QUESTION"
        );

    });

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(text) {

    return String(text || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}