import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "";
const RESUME_FILE_NAME = "24EG105V33_P.SHESHENDRAKASHYAP.pdf";

/* ======================== APP ======================== */

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">I</div>
          <div>
            <h2>InternPilot</h2>
            <span>AI Application Assistant</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            type="button"
            className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("dashboard")}
          >
            <span>⌂</span> Dashboard
          </button>

          <button
            type="button"
            className={activePage === "application" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("application")}
          >
            <span>＋</span> New Application
          </button>

          <button
            type="button"
            className={activePage === "profile" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("profile")}
          >
            <span>◯</span> My Profile
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="extension-card">
            <div className="extension-icon">⚡</div>
            <strong>Browser Extension</strong>
            <p>Autofill internship applications faster.</p>
            <button type="button" onClick={() => setActivePage("application")}>
              Open Applications
            </button>
          </div>

          <div className="user-mini">
            <div className="avatar">SK</div>
            <div>
              <strong>Sheshendra</strong>
              <span>B.Tech CSE</span>
            </div>
            <span className="dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "dashboard" && (
          <Dashboard setActivePage={setActivePage} />
        )}
        {activePage === "application" && <Application />}
        {activePage === "profile" && <Profile />}
      </main>
    </div>
  );
}

/* ======================== DASHBOARD ======================== */

function Dashboard({ setActivePage }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/jobs`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Jobs API error:", err);
        if (!cancelled) {
          setError("Unable to connect to the backend.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Good morning, Sheshendra 👋</h1>
          <p className="header-description">
            Manage your internship applications with InternPilot AI.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setActivePage("application")}
        >
          + New Application
        </button>
      </header>

      <section className="stats-grid">
        <StatCard
          title="Internships"
          value={loading ? "..." : jobs.length}
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

      <section className="quick-start">
        <div>
          <span className="section-label">QUICK START</span>
          <h2>Ready to apply?</h2>
          <p>
            Paste an internship application URL and let InternPilot prepare
            your application.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setActivePage("application")}
        >
          Start Application →
        </button>
      </section>

      <section className="application-table">
        <div className="table-header">
          <h3>Available Internships</h3>
          <button
            type="button"
            className="view-all"
            onClick={() => setActivePage("application")}
          >
            New Application
          </button>
        </div>

        {loading && (
          <div className="empty-state">
            <div className="loading-spinner">⟳</div>
            <p>Loading internships from backend...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state error-state">
            <div>⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <div>📋</div>
            <p>No internships found.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Location</th>
                  <th>Skills</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="company-cell">
                        <div className="company-logo">
                          {job.company?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <strong>{job.company || "Unknown"}</strong>
                      </div>
                    </td>
                    <td>{job.title || "Untitled Position"}</td>
                    <td>{job.location || "Not specified"}</td>
                    <td>{job.skills || "Not specified"}</td>
                    <td>
                      {job.matchScore != null ? (
                        <span className="status review">{job.matchScore}%</span>
                      ) : (
                        <span className="status draft">Not analyzed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="application-table">
        <div className="table-header">
          <h3>Recent Applications</h3>
          <button
            type="button"
            className="view-all"
            onClick={() => setActivePage("application")}
          >
            Start Application
          </button>
        </div>
        <div className="empty-state">
          <div>📝</div>
          <p>No applications prepared yet.</p>
          <small>Start your first internship application.</small>
          <button
            type="button"
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

/* ======================== STAT CARD ======================== */

function StatCard({ title, value, description, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <h2>{value}</h2>
      <p>{description}</p>
    </div>
  );
}

/* ======================== APPLICATION PAGE ======================== */

function Application() {
  const [applicationUrl, setApplicationUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");

  function analyzeInternship(event) {
    event.preventDefault();

    if (!applicationUrl.trim() && !jobDescription.trim()) {
      setMessage("Please enter an application URL or job description.");
      return;
    }

    setAnalyzing(true);
    setMessage("");

    // This page currently validates input only; backend analysis is not connected.
    window.setTimeout(() => {
      setAnalyzing(false);
      setMessage(
        "Internship details received. Backend analysis is not connected yet."
      );
    }, 700);
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">NEW APPLICATION</p>
          <h1>Prepare an Application</h1>
          <p className="header-description">
            Prepare truthful, resume-supported application content.
          </p>
        </div>
      </header>

      <div className="application-layout">
        <section className="application-card">
          <h2>Internship Details</h2>
          <form onSubmit={analyzeInternship}>
            <label htmlFor="application-url">Application URL</label>
            <input
              id="application-url"
              type="url"
              value={applicationUrl}
              onChange={(event) => setApplicationUrl(event.target.value)}
              placeholder="https://company.com/careers/internship"
            />

            <label htmlFor="job-description">Job Description</label>
            <textarea
              id="job-description"
              rows={10}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the internship/job description here..."
            />

            <button
              type="submit"
              className="primary-button full-width"
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "Analyze Internship"}
            </button>
          </form>

          {message && (
            <div className="form-message" role="status">
              {message}
            </div>
          )}
        </section>

        <section className="application-card">
          <h2>What InternPilot will do</h2>
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

      <section className="trust-banner">
        <span>✓</span>
        <div>
          <strong>You stay in control</strong>
          <p>You review the final application and submit it yourself.</p>
        </div>
      </section>
    </div>
  );
}

function WorkflowItem({ number, title, description }) {
  return (
    <div className="workflow-item">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

/* ======================== PROFILE PAGE ======================== */

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [notice, setNotice] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(
      `${API_BASE_URL}/api/resume/parse?fileName=${encodeURIComponent(
        RESUME_FILE_NAME
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Profile API error:", err);
        if (!cancelled) {
          setError("Unable to load profile from backend.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // All hooks are declared above early returns to obey React's Rules of Hooks.

  async function handleResumeUpload(event) {
    event.preventDefault();

    if (!resumeFile) {
      setUploadStatus("Please select a PDF resume first.");
      return;
    }

    const isPdf =
      resumeFile.type === "application/pdf" ||
      resumeFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setUploadStatus("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      setUploading(true);
      setUploadStatus("Uploading resume...");
      setUploadedFileName("");

      const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || `Upload failed (${response.status}).`);
      }

      setUploadedFileName(resumeFile.name);
      setUploadStatus(message || "Resume uploaded successfully.");
    } catch (uploadError) {
      console.error("Resume upload error:", uploadError);
      setUploadStatus(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function loadProfileFromResume(fileName) {
    const response = await fetch(
      `${API_BASE_URL}/api/resume/parse?fileName=${encodeURIComponent(fileName)}`
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Profile parsing failed (${response.status}).`);
    }

    const data = await response.json();
    setProfile(data);
    setError("");
    return data;
  }

  async function handleParseUploadedResume() {
    if (!uploadedFileName) {
      setUploadStatus("Upload a resume successfully before parsing it.");
      return;
    }

    try {
      setUploading(true);
      setUploadStatus("Extracting profile details...");

      await loadProfileFromResume(uploadedFileName);

      setUploadStatus("Resume parsed. Your displayed profile has been refreshed.");
    } catch (parseError) {
      console.error("Resume parsing error:", parseError);
      setUploadStatus(
        parseError instanceof Error
          ? parseError.message
          : "Unable to parse the uploaded resume."
      );
    } finally {
      setUploading(false);
    }
  }

  function startEditing() {
    const student = profile?.student || profile || {};
    const education = student.education || {};

    setEditForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      location: student.location || "",
      github: student.github || "",
      linkedin: student.linkedin || "",
      education: {
        degree: education.degree || "",
        branch: education.branch || "",
        university: education.university || "",
        cgpa: education.cgpa ?? "",
        graduationYear: education.graduationYear ?? "",
      },
    });

    setNotice("");
    setIsEditing(true);
  }

  function updateField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function updateEducation(field, value) {
    setEditForm((current) => ({
      ...current,
      education: {
        ...current.education,
        [field]: value,
      },
    }));
  }

  function saveProfile(event) {
    event.preventDefault();

    if (!editForm) return;

    const student = profile?.student || profile || {};
    const education = student.education || {};

    const updatedStudent = {
      ...student,
      ...editForm,
      education: {
        ...education,
        ...editForm.education,
      },
    };

    const updatedProfile = profile?.student
      ? { ...profile, student: updatedStudent }
      : updatedStudent;

    setProfile(updatedProfile);
    setIsEditing(false);
    setEditForm(null);
    setNotice(
      "Changes updated on this page only. They are not yet saved to the database."
    );
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner">⟳</div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const student = profile?.student || profile || {};
  const education = student.education || {};

  const skills = Array.isArray(student.skills) ? student.skills : [];
  const projects = Array.isArray(student.projects) ? student.projects : [];
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
      <header className="page-header">
        <div>
          <p className="eyebrow">PROFILE</p>
          <h1>My Profile</h1>
          <p className="header-description">
            Upload your resume and view or edit the information extracted from it.
          </p>
        </div>

        {!isEditing && !error && (
          <button
            type="button"
            className="secondary-button"
            onClick={startEditing}
          >
            Edit Profile
          </button>
        )}
      </header>

      {notice && (
        <div className="form-message" role="status">
          {notice}
        </div>
      )}

      <section className="application-card resume-upload-card">
        <h2>My Resume</h2>
        <p>Choose a PDF resume to upload to InternPilot.</p>

        <form onSubmit={handleResumeUpload}>
          <label htmlFor="resume-upload">Resume file (PDF)</label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setResumeFile(event.target.files?.[0] || null);
              setUploadStatus("");
              setUploadedFileName("");
            }}
          />

          {resumeFile && (
            <p className="resume-file-name">
              Selected: {resumeFile.name}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={uploading || !resumeFile}
          >
            {uploading ? "Please wait..." : "Upload Resume"}
          </button>
        </form>

        {uploadedFileName && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleParseUploadedResume}
            disabled={uploading}
          >
            Parse Uploaded Resume
          </button>
        )}

        {uploadStatus && (
          <p className="form-message" role="status" aria-live="polite">
            {uploadStatus}
          </p>
        )}
      </section>

      {error && (
        <section className="application-card">
          <div className="empty-state error-state">
            <div>⚠️</div>
            <p>{error}</p>
            <small>
              You can still upload a resume above. Check that the backend is
              running and that the configured default resume exists.
            </small>
          </div>
        </section>
      )}

      {isEditing && editForm && (
        <section className="details-card profile-section">
          <h3>Edit Personal Information</h3>

          <form onSubmit={saveProfile}>
            <div className="details-grid">
              <div>
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  value={editForm.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  value={editForm.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="profile-location">Location</label>
                <input
                  id="profile-location"
                  value={editForm.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="profile-degree">Degree</label>
                <input
                  id="profile-degree"
                  value={editForm.education.degree}
                  onChange={(event) =>
                    updateEducation("degree", event.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-branch">Branch</label>
                <input
                  id="profile-branch"
                  value={editForm.education.branch}
                  onChange={(event) =>
                    updateEducation("branch", event.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-university">University</label>
                <input
                  id="profile-university"
                  value={editForm.education.university}
                  onChange={(event) =>
                    updateEducation("university", event.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-cgpa">CGPA</label>
                <input
                  id="profile-cgpa"
                  value={editForm.education.cgpa}
                  onChange={(event) =>
                    updateEducation("cgpa", event.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-graduation">Graduation Year</label>
                <input
                  id="profile-graduation"
                  value={editForm.education.graduationYear}
                  onChange={(event) =>
                    updateEducation("graduationYear", event.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-github">GitHub URL</label>
                <input
                  id="profile-github"
                  type="url"
                  value={editForm.github}
                  onChange={(event) => updateField("github", event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="profile-linkedin">LinkedIn URL</label>
                <input
                  id="profile-linkedin"
                  type="url"
                  value={editForm.linkedin}
                  onChange={(event) =>
                    updateField("linkedin", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-links">
              <button type="submit" className="primary-button">
                Save Changes
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {!error && (
        <>
          <div className="profile-grid">
            <section className="profile-card">
              <div className="profile-avatar">{getInitials(student.name || "SK")}</div>
              <h2>{student.name || "Sheshendra Kashyap Parnandi"}</h2>
              <p>{education.branch || "Computer Science Engineering"}</p>
              <p>{education.university || "Anurag University"}</p>

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

            <section className="details-card">
              <h3>Personal Information</h3>
              <div className="details-grid">
                <ProfileDetail label="Email" value={student.email} />
                <ProfileDetail label="Phone" value={student.phone} />
                <ProfileDetail label="Location" value={student.location} />
                <ProfileDetail label="Degree" value={education.degree} />
                <ProfileDetail label="Branch" value={education.branch} />
                <ProfileDetail label="CGPA" value={education.cgpa} />
                <ProfileDetail label="University" value={education.university} />
                <ProfileDetail label="Graduation" value={education.graduationYear} />
              </div>
            </section>

            <section className="details-card skills-card">
              <h3>Technical Skills</h3>
              <div className="skills">
                {skills.length ? (
                  skills.map((skill, index) => (
                    <span key={index}>
                      {typeof skill === "string"
                        ? skill
                        : skill.name || skill.skill || "Skill"}
                    </span>
                  ))
                ) : (
                  <p>No skills found.</p>
                )}
              </div>
            </section>
          </div>

          <ProfileList
            title="Projects"
            subtitle="Projects extracted from your resume."
            items={projects}
            emptyText="No projects found in the parsed resume."
            renderItem={(project) => (
              <div className="project-item">
                <h4>{project.name || "Untitled Project"}</h4>
                {Array.isArray(project.technologies) &&
                  project.technologies.length > 0 && (
                    <div className="project-technologies">
                      {project.technologies.map((technology, index) => (
                        <span key={index}>{technology}</span>
                      ))}
                    </div>
                  )}
                {Array.isArray(project.details) && project.details.length > 0 && (
                  <ul>
                    {project.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
                {project.description && <p>{project.description}</p>}
              </div>
            )}
          />

          <ProfileList
            title="Internships & Experience"
            subtitle="Professional and research experience."
            items={internships}
            emptyText="No internship experience found."
            renderItem={(item) => (
              <div className="experience-item">
                <h4>{item.role || "Internship"}</h4>
                <p className="experience-company">
                  {item.company || "Company not specified"}
                  {item.duration ? ` • ${item.duration}` : ""}
                  {item.type ? ` • ${item.type}` : ""}
                </p>
                {Array.isArray(item.details) && item.details.length > 0 && (
                  <ul>
                    {item.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          />

          <ProfileList
            title="Certifications"
            subtitle="Certifications extracted from your resume."
            items={certifications}
            emptyText="No certifications found."
            renderItem={(item) => (
              <li>
                {typeof item === "string"
                  ? item
                  : item.name || item.title || JSON.stringify(item)}
              </li>
            )}
            list
          />

          <ProfileList
            title="Achievements"
            subtitle="Achievements extracted from your resume."
            items={achievements}
            emptyText="No achievements found."
            renderItem={(item) => (
              <li>
                {typeof item === "string"
                  ? item
                  : item.title || item.name || JSON.stringify(item)}
              </li>
            )}
            list
          />
        </>
      )}
    </div>
  );
}

/* ======================== PROFILE LIST SECTION ======================== */

function ProfileList({ title, subtitle, items, emptyText, renderItem, list = false }) {
  return (
    <section className="details-card profile-section">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="section-count">{items.length}</span>
      </div>

      {items.length ? (
        list ? (
          <ul className="simple-list">
            {items.map((item, index) => (
              <ReactFragmentItem key={index}>{renderItem(item)}</ReactFragmentItem>
            ))}
          </ul>
        ) : (
          <div className={title === "Projects" ? "project-list" : "experience-list"}>
            {items.map((item, index) => (
              <ReactFragmentItem key={index}>{renderItem(item)}</ReactFragmentItem>
            ))}
          </div>
        )
      ) : (
        <p className="empty-section">{emptyText}</p>
      )}
    </section>
  );
}

function ReactFragmentItem({ children }) {
  return <>{children}</>;
}

/* ======================== PROFILE DETAIL ======================== */

function ProfileDetail({ label, value }) {
  const displayValue =
    value !== null && value !== undefined && value !== ""
      ? value
      : "Not available";

  return (
    <div>
      <label>{label}</label>
      <p>{displayValue}</p>
    </div>
  );
}

/* ======================== HELPER ======================== */

function getInitials(name) {
  if (!name) return "SK";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default App;