import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8080";

const RESUME_FILE_NAME =
    "24EG105V33_P.SHESHENDRAKASHYAP.pdf";


function App() {

  const [activePage, setActivePage] = useState("dashboard");

  return (
      <div className="app">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <div className="logo">

            <div className="logo-icon">
              I
            </div>

            <div>
              <h2>InternPilot</h2>
              <span>AI Application Assistant</span>
            </div>

          </div>


          <nav className="navigation">

            <button
                className={
                  activePage === "dashboard"
                      ? "nav-item active"
                      : "nav-item"
                }
                onClick={() => setActivePage("dashboard")}
            >
              <span>⌂</span>
              Dashboard
            </button>


            <button
                className={
                  activePage === "application"
                      ? "nav-item active"
                      : "nav-item"
                }
                onClick={() => setActivePage("application")}
            >
              <span>＋</span>
              New Application
            </button>


            <button
                className={
                  activePage === "profile"
                      ? "nav-item active"
                      : "nav-item"
                }
                onClick={() => setActivePage("profile")}
            >
              <span>◯</span>
              My Profile
            </button>

          </nav>


          <div className="sidebar-bottom">

            <div className="extension-card">

              <div className="extension-icon">
                ⚡
              </div>

              <strong>
                Browser Extension
              </strong>

              <p>
                Autofill internship applications faster.
              </p>

              <button>
                Connect
              </button>

            </div>


            <div className="user-mini">

              <div className="avatar">
                SK
              </div>

              <div>
                <strong>
                  Sheshendra
                </strong>

                <span>
                B.Tech CSE
              </span>
              </div>

              <span className="dots">
              •••
            </span>

            </div>

          </div>

        </aside>


        {/* ================= MAIN ================= */}

        <main className="main-content">

          {activePage === "dashboard" && (
              <Dashboard
                  setActivePage={setActivePage}
              />
          )}


          {activePage === "application" && (
              <Application />
          )}


          {activePage === "profile" && (
              <Profile />
          )}

        </main>

      </div>
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard({ setActivePage }) {

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* -----------------------------------------------
     LOAD JOBS FROM SPRING BOOT
  ------------------------------------------------ */

  useEffect(() => {

    fetch(`${API_BASE_URL}/api/jobs`)

        .then((response) => {

          if (!response.ok) {
            throw new Error(
                `Backend returned ${response.status}`
            );
          }

          return response.json();

        })

        .then((data) => {

          console.log("Jobs received from backend:", data);

          setJobs(Array.isArray(data) ? data : []);

          setLoading(false);

        })

        .catch((err) => {

          console.error(
              "Error connecting to Spring Boot:",
              err
          );

          setError(
              "Unable to connect to the Spring Boot backend."
          );

          setLoading(false);

        });

  }, []);


  return (

      <div>

        {/* ================= HEADER ================= */}

        <header className="page-header">

          <div>

            <p className="eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Good morning, Sheshendra 👋
            </h1>

            <p className="header-description">
              Manage your internship applications with InternPilot AI.
            </p>

          </div>


          <button
              className="primary-button"
              onClick={() => setActivePage("application")}
          >
            + New Application
          </button>

        </header>


        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          <StatCard
              title="Internships"
              value={
                loading
                    ? "..."
                    : jobs.length
              }
              description="Available internships"
              icon="▣"
          />


          <StatCard
              title="Applications"
              value="0"
              description="Applications prepared"
              icon="✓"
          />


          <StatCard
              title="Profile Match"
              value="85%"
              description="Based on your profile"
              icon="◎"
          />


          <StatCard
              title="Time Saved"
              value="0h"
              description="Estimated this month"
              icon="◷"
          />

        </section>


        {/* ================= QUICK START ================= */}

        <section className="quick-start">

          <div>

          <span className="section-label">
            QUICK START
          </span>

            <h2>
              Ready to apply?
            </h2>

            <p>
              Paste an internship application URL and let
              InternPilot prepare your application.
            </p>

          </div>


          <button
              className="secondary-button"
              onClick={() => setActivePage("application")}
          >
            Start Application →
          </button>

        </section>


        {/* ================= BACKEND JOBS ================= */}

        <section className="application-table">

          <div className="table-header">

            <h3>
              Available Internships
            </h3>

            <button
                className="view-all"
                onClick={() => setActivePage("application")}
            >
              New Application
            </button>

          </div>


          {/* Loading */}

          {loading && (

              <div className="empty-state">

                <div className="loading-spinner">
                  ⟳
                </div>

                <p>
                  Loading internships from backend...
                </p>

              </div>

          )}


          {/* Error */}

          {!loading && error && (

              <div className="empty-state error-state">

                <div>
                  ⚠️
                </div>

                <p>
                  {error}
                </p>

                <small>
                  Make sure Spring Boot is running on port 8080.
                </small>

              </div>

          )}


          {/* No jobs */}

          {!loading &&
              !error &&
              jobs.length === 0 && (

                  <div className="empty-state">

                    <div>
                      📋
                    </div>

                    <p>
                      No internships found.
                    </p>

                    <small>
                      Add internships through the Spring Boot API.
                    </small>

                  </div>

              )}


          {/* Jobs */}

          {!loading &&
              !error &&
              jobs.length > 0 && (

                  <div className="table-wrapper">

                    <table>

                      <thead>

                      <tr>

                        <th>
                          Company
                        </th>

                        <th>
                          Position
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Skills
                        </th>

                        <th>
                          Match
                        </th>

                      </tr>

                      </thead>


                      <tbody>

                      {jobs.map((job) => (

                          <tr key={job.id}>

                            <td>

                              <div className="company-cell">

                                <div className="company-logo">

                                  {job.company
                                      ? job.company.charAt(0).toUpperCase()
                                      : "?"}

                                </div>


                                <strong>
                                  {job.company || "Unknown"}
                                </strong>

                              </div>

                            </td>


                            <td>
                              {job.title || "Untitled Position"}
                            </td>


                            <td>
                              {job.location || "Not specified"}
                            </td>


                            <td>
                              {job.skills || "Not specified"}
                            </td>


                            <td>

                              {job.matchScore !== null &&
                              job.matchScore !== undefined ? (

                                  <span className="status review">
                            {job.matchScore}%
                          </span>

                              ) : (

                                  <span className="status draft">
                            Not analyzed
                          </span>

                              )}

                            </td>

                          </tr>

                      ))}

                      </tbody>

                    </table>

                  </div>

              )}

        </section>


        {/* ================= RECENT APPLICATIONS ================= */}

        <section className="application-table">

          <div className="table-header">

            <h3>
              Recent Applications
            </h3>

            <button
                className="view-all"
                onClick={() => setActivePage("application")}
            >
              Start Application
            </button>

          </div>


          <div className="empty-state">

            <div>
              📝
            </div>

            <p>
              No applications prepared yet.
            </p>

            <small>
              Start your first internship application.
            </small>


            <button
                className="primary-button"
                onClick={() => setActivePage("application")}
            >
              + New Application
            </button>

          </div>

        </section>

      </div>

  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
                    title,
                    value,
                    description,
                    icon
                  }) {

  return (

      <div className="stat-card">

        <div className="stat-top">

        <span className="stat-title">
          {title}
        </span>

          <span className="stat-icon">
          {icon}
        </span>

        </div>


        <h2>
          {value}
        </h2>


        <p>
          {description}
        </p>

      </div>

  );
}


/* =====================================================
   APPLICATION PAGE
===================================================== */

function Application() {

  const [applicationUrl, setApplicationUrl] = useState("");

  const [jobDescription, setJobDescription] = useState("");

  const [analyzing, setAnalyzing] = useState(false);

  const [message, setMessage] = useState("");


  function analyzeInternship() {

    if (
        applicationUrl.trim() === "" &&
        jobDescription.trim() === ""
    ) {

      setMessage(
          "Please enter an application URL or job description."
      );

      return;
    }


    setAnalyzing(true);

    setMessage("");


    /*
      At this stage we are only preparing the frontend.

      The next backend step will:
      1. Receive the URL/JD
      2. Extract job information
      3. Compare it with the student profile
      4. Generate application questions
      5. Return the analysis
    */

    setTimeout(() => {

      setAnalyzing(false);

      setMessage(
          "Internship details received. Backend analysis will be connected next."
      );

    }, 700);

  }


  return (

      <div>

        {/* ================= HEADER ================= */}

        <header className="page-header">

          <div>

            <p className="eyebrow">
              NEW APPLICATION
            </p>

            <h1>
              Prepare an Application
            </h1>

            <p className="header-description">
              InternPilot analyzes the internship and prepares
              truthful, resume-supported application content.
            </p>

          </div>

        </header>


        {/* ================= APPLICATION FORM ================= */}

        <div className="application-layout">

          <section className="application-card">

            <h2>
              Internship Details
            </h2>


            <label>
              Application URL
            </label>


            <input
                type="text"
                value={applicationUrl}
                onChange={(event) =>
                    setApplicationUrl(event.target.value)
                }
                placeholder="https://company.com/careers/internship"
            />


            <label>
              Job Description
            </label>


            <textarea
                rows="10"
                value={jobDescription}
                onChange={(event) =>
                    setJobDescription(event.target.value)
                }
                placeholder="Paste the internship/job description here..."
            />


            <button
                className="primary-button full-width"
                onClick={analyzeInternship}
                disabled={analyzing}
            >

              {analyzing
                  ? "Analyzing..."
                  : "Analyze Internship"}

            </button>


            {message && (

                <div className="form-message">

                  {message}

                </div>

            )}

          </section>


          {/* ================= WORKFLOW ================= */}

          <section className="application-card">

            <h2>
              What InternPilot will do
            </h2>


            <WorkflowItem
                number="1"
                title="Analyze the internship"
                description="Identify required skills and application questions."
            />


            <WorkflowItem
                number="2"
                title="Compare your profile"
                description="Use information supported by your resume."
            />


            <WorkflowItem
                number="3"
                title="Prepare answers"
                description="Generate application content for your review."
            />


            <WorkflowItem
                number="4"
                title="Autofill"
                description="Fill the browser application after your review."
            />

          </section>

        </div>


        {/* ================= TRUST ================= */}

        <section className="trust-banner">

        <span>
          ✓
        </span>


          <div>

            <strong>
              You stay in control
            </strong>


            <p>
              InternPilot does not automatically submit applications.
              You review the final application and submit it yourself.
            </p>

          </div>

        </section>

      </div>

  );
}


/* =====================================================
   WORKFLOW ITEM
===================================================== */

function WorkflowItem({
                        number,
                        title,
                        description
                      }) {

  return (

      <div className="workflow-item">

      <span>
        {number}
      </span>


        <div>

          <strong>
            {title}
          </strong>


          <p>
            {description}
          </p>

        </div>

      </div>

  );
}


/* =====================================================
   PROFILE PAGE
===================================================== */


function Profile() {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    fetch(
        `${API_BASE_URL}/api/resume/parse?fileName=${encodeURIComponent(
            RESUME_FILE_NAME
        )}`
    )

        .then((response) => {

          if (!response.ok) {
            throw new Error(
                `Backend returned ${response.status}`
            );
          }

          return response.json();

        })

        .then((data) => {

          console.log("Complete profile:", data);

          setProfile(data);

          setLoading(false);

        })

        .catch((err) => {

          console.error("Profile API error:", err);

          setError(
              "Unable to load profile from backend."
          );

          setLoading(false);

        });

  }, []);


  if (loading) {

    return (

        <div className="empty-state">

          <div className="loading-spinner">
            ⟳
          </div>

          <p>
            Loading your profile...
          </p>

        </div>

    );

  }


  if (error) {

    return (

        <div>

          <header className="page-header">

            <div>

              <p className="eyebrow">
                PROFILE
              </p>

              <h1>
                My Profile
              </h1>

            </div>

          </header>


          <section className="application-card">

            <div className="empty-state">

              <div>
                ⚠️
              </div>

              <p>
                {error}
              </p>

              <small>
                Check your backend and uploaded resume.
              </small>

            </div>

          </section>

        </div>

    );

  }


  /*
    The backend parser currently returns the profile
    inside the "student" object.
  */

  const student = profile?.student || profile || {};


  const education = student.education || {};


  const skills = Array.isArray(student.skills)
      ? student.skills
      : [];


  const projects = Array.isArray(student.projects)
      ? student.projects
      : [];


  const internships = Array.isArray(student.internships)
      ? student.internships
      : [];


  const certifications = Array.isArray(student.certifications)
      ? student.certifications
      : [];


  const achievements = Array.isArray(student.achievements)
      ? student.achievements
      : [];


  return (

      <div>

        {/* ================= HEADER ================= */}

        <header className="page-header">

          <div>

            <p className="eyebrow">
              PROFILE
            </p>

            <h1>
              My Profile
            </h1>

            <p className="header-description">
              Information extracted from your resume.
            </p>

          </div>


          <button className="secondary-button">
            Edit Profile
          </button>

        </header>


        {/* ================= BASIC PROFILE ================= */}

        <div className="profile-grid">

          <section className="profile-card">

            <div className="profile-avatar">

              {getInitials(student.name || "SK")}

            </div>


            <h2>
              {student.name || "Sheshendra Kashyap Parnandi"}
            </h2>


            <p>
              {education.branch || "Computer Science Engineering"}
            </p>


            <p>
              {education.university || "Anurag University"}
            </p>


            <div className="profile-links">

              {student.github && (

                  <a
                      href={student.github}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-link"
                  >
                    GitHub
                  </a>

              )}


              {student.linkedin && (

                  <a
                      href={student.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-link"
                  >
                    LinkedIn
                  </a>

              )}

            </div>

          </section>


          {/* ================= PERSONAL INFORMATION ================= */}

          <section className="details-card">

            <h3>
              Personal Information
            </h3>


            <div className="details-grid">

              <ProfileDetail
                  label="Email"
                  value={student.email || "Not available"}
              />


              <ProfileDetail
                  label="Phone"
                  value={student.phone || "Not available"}
              />


              <ProfileDetail
                  label="Location"
                  value={student.location || "Not available"}
              />


              <ProfileDetail
                  label="Degree"
                  value={education.degree || "Not available"}
              />


              <ProfileDetail
                  label="Branch"
                  value={education.branch || "Not available"}
              />


              <ProfileDetail
                  label="CGPA"
                  value={education.cgpa || "Not available"}
              />


              <ProfileDetail
                  label="University"
                  value={education.university || "Not available"}
              />


              <ProfileDetail
                  label="Graduation"
                  value={education.graduationYear || "Not available"}
              />

            </div>

          </section>


          {/* ================= SKILLS ================= */}

          <section className="details-card skills-card">

            <h3>
              Technical Skills
            </h3>


            <div className="skills">

              {skills.length > 0 ? (

                  skills.map((skill, index) => (

                      <span key={index}>

                  {typeof skill === "string"
                      ? skill
                      : skill.name ||
                      skill.skill ||
                      "Skill"}

                </span>

                  ))

              ) : (

                  <p>
                    No skills found.
                  </p>

              )}

            </div>

          </section>

        </div>


        {/* ================= PROJECTS ================= */}

        <section className="details-card profile-section">

          <div className="section-heading">

            <div>

              <h3>
                Projects
              </h3>

              <p>
                Projects extracted from your resume.
              </p>

            </div>

            <span className="section-count">
            {projects.length}
          </span>

          </div>


          {projects.length > 0 ? (

              <div className="project-list">

                {projects.map((project, index) => (

                    <div
                        className="project-item"
                        key={index}
                    >

                      <h4>
                        {project.name || "Untitled Project"}
                      </h4>


                      {project.technologies &&
                          project.technologies.length > 0 && (

                              <div className="project-technologies">

                                {project.technologies.map(
                                    (technology, techIndex) => (

                                        <span key={techIndex}>
                            {technology}
                          </span>

                                    )
                                )}

                              </div>

                          )}


                      {project.details &&
                          project.details.length > 0 && (

                              <ul>

                                {project.details.map(
                                    (detail, detailIndex) => (

                                        <li key={detailIndex}>
                                          {detail}
                                        </li>

                                    )
                                )}

                              </ul>

                          )}


                      {project.description && (

                          <p>
                            {project.description}
                          </p>

                      )}

                    </div>

                ))}

              </div>

          ) : (

              <p className="empty-section">
                No projects found in the parsed resume.
              </p>

          )}

        </section>


        {/* ================= INTERNSHIPS ================= */}

        <section className="details-card profile-section">

          <div className="section-heading">

            <div>

              <h3>
                Internships & Experience
              </h3>

              <p>
                Professional and research experience.
              </p>

            </div>

            <span className="section-count">
            {internships.length}
          </span>

          </div>


          {internships.length > 0 ? (

              <div className="experience-list">

                {internships.map((internship, index) => (

                    <div
                        className="experience-item"
                        key={index}
                    >

                      <h4>
                        {internship.role || "Internship"}
                      </h4>


                      <p className="experience-company">

                        {internship.company || "Company not specified"}

                        {internship.duration
                            ? ` • ${internship.duration}`
                            : ""}

                        {internship.type
                            ? ` • ${internship.type}`
                            : ""}

                      </p>


                      {internship.details &&
                          internship.details.length > 0 && (

                              <ul>

                                {internship.details.map(
                                    (detail, detailIndex) => (

                                        <li key={detailIndex}>
                                          {detail}
                                        </li>

                                    )
                                )}

                              </ul>

                          )}

                    </div>

                ))}

              </div>

          ) : (

              <p className="empty-section">
                No internship experience found.
              </p>

          )}

        </section>


        {/* ================= CERTIFICATIONS ================= */}

        <section className="details-card profile-section">

          <div className="section-heading">

            <div>

              <h3>
                Certifications
              </h3>

              <p>
                Certifications extracted from your resume.
              </p>

            </div>

            <span className="section-count">
            {certifications.length}
          </span>

          </div>


          {certifications.length > 0 ? (

              <ul className="simple-list">

                {certifications.map((certification, index) => (

                    <li key={index}>

                      {typeof certification === "string"
                          ? certification
                          : certification.name ||
                          certification.title ||
                          JSON.stringify(certification)}

                    </li>

                ))}

              </ul>

          ) : (

              <p className="empty-section">
                No certifications found.
              </p>

          )}

        </section>


        {/* ================= ACHIEVEMENTS ================= */}

        <section className="details-card profile-section">

          <div className="section-heading">

            <div>

              <h3>
                Achievements
              </h3>

              <p>
                Achievements extracted from your resume.
              </p>

            </div>

            <span className="section-count">
            {achievements.length}
          </span>

          </div>


          {achievements.length > 0 ? (

              <ul className="simple-list">

                {achievements.map((achievement, index) => (

                    <li key={index}>

                      {typeof achievement === "string"
                          ? achievement
                          : achievement.title ||
                          achievement.name ||
                          JSON.stringify(achievement)}

                    </li>

                ))}

              </ul>

          ) : (

              <p className="empty-section">
                No achievements found.
              </p>

          )}

        </section>

      </div>

  );

}


/* =====================================================
   PROFILE DETAIL
===================================================== */

function ProfileDetail({
                         label,
                         value
                       }) {

  return (

      <div>

        <label>
          {label}
        </label>


        <p>
          {value}
        </p>

      </div>

  );
}


/* =====================================================
   HELPER
===================================================== */

function getInitials(name) {

  if (!name) {
    return "SK";
  }


  const parts = name
      .trim()
      .split(/\s+/);


  if (parts.length === 1) {
    return parts[0]
        .substring(0, 2)
        .toUpperCase();
  }


  return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
  ).toUpperCase();

}


export default App;