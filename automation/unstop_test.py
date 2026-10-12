from pathlib import Path
from playwright.sync_api import sync_playwright


# ============================================================
# PUT THE UNSTOP APPLICATION URL HERE
# ============================================================

UNSTOP_URL = "PASTE_UNSTOP_APPLICATION_URL_HERE"


# ============================================================
# EXTRACT JOB DESCRIPTION
# ============================================================

def extract_unstop_jd(page):

    print("\nLooking for Job Description...")

    # --------------------------------------------------------
    # First: try common content selectors
    # --------------------------------------------------------

    selectors = [
        "#job-description",
        "[class*='job-description']",
        "[class*='jobDescription']",
        "[class*='description']",
        "[class*='Description']",
        "article"
    ]

    for selector in selectors:

        try:

            elements = page.locator(selector)

            count = elements.count()

            if count > 0:

                for i in range(count):

                    text = (
                        elements.nth(i)
                        .inner_text()
                        .strip()
                    )

                    if len(text) > 150:

                        print(
                            f"\nFound content using: {selector}"
                        )

                        return text

        except Exception:

            continue

    # --------------------------------------------------------
    # Fallback: inspect the visible page text
    # --------------------------------------------------------

    print(
        "\nTrying page-text analysis..."
    )

    try:

        body_text = (
            page.locator("body")
            .inner_text()
            .strip()
        )

        if len(body_text) > 150:

            return body_text

    except Exception as e:

        print(
            "Could not read page text."
        )

        print(e)

    return ""


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print(
        "=========================================="
    )

    print(
        "       INTERNPILOT UNSTOP TEST"
    )

    print(
        "=========================================="
    )

    if (
        "PASTE_UNSTOP"
        in UNSTOP_URL
    ):

        print(
            "\nPlease put the Unstop application URL"
            " inside UNSTOP_URL first."
        )

        return

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=False
        )

        page = browser.new_page(
            viewport={
                "width": 1440,
                "height": 900
            }
        )

        print(
            "\nOpening Unstop..."
        )

        page.goto(
            UNSTOP_URL,
            wait_until="domcontentloaded",
            timeout=60000
        )

        print(
            "Unstop page opened."
        )

        print()
        print(
            "If Unstop asks you to log in,"
        )

        print(
            "log in manually in the browser."
        )

        print(
            "Then open the internship application"
        )

        print(
            "and navigate to the application form."
        )

        input(
            "\nPress ENTER after the application page "
            "is ready..."
        )

        # ----------------------------------------------------
        # EXTRACT PAGE TITLE
        # ----------------------------------------------------

        print(
            "\nPage title:"
        )

        print(
            page.title()
        )

        # ----------------------------------------------------
        # EXTRACT JD
        # ----------------------------------------------------

        job_description = (
            extract_unstop_jd(page)
        )

        if not job_description:

            print(
                "\nCould not extract page content."
            )

            input(
                "\nPress ENTER to close..."
            )

            browser.close()

            return

        # ----------------------------------------------------
        # DISPLAY EXTRACTED CONTENT
        # ----------------------------------------------------

        print()
        print(
            "=========================================="
        )

        print(
            "       CONTENT EXTRACTED"
        )

        print(
            "=========================================="
        )

        print(
            job_description
        )

        print(
            "=========================================="
        )

        # ----------------------------------------------------
        # SAVE FOR INSPECTION
        # ----------------------------------------------------

        output_file = Path(
            "unstop_extracted_text.txt"
        )

        output_file.write_text(
            job_description,
            encoding="utf-8"
        )

        print(
            f"\nSaved extracted text to:"
        )

        print(
            output_file.resolve()
        )

        print(
            "\nIMPORTANT:"
        )

        print(
            "This test ONLY reads the page."
        )

        print(
            "It does NOT fill or submit anything."
        )

        input(
            "\nPress ENTER to close browser..."
        )

        browser.close()


if __name__ == "__main__":

    main()
