# ⚡ Enterprise Job Portal & Applicant Tracking System (ATS)
> **Production Reference Architecture** | Spring Boot 3.3.4 (Java 21) + Vite React 18 (RBAC: ADMIN, MANAGER, USER | JWT HttpOnly | ATS Resume Matcher | Automated CI/CD)

---

## 🌟 Key Enterprise Capabilities

- **⚡ AI ATS Match Engine:** Real-time semantic keyword extraction analyzing candidate competencies against job postings, generating a compatibility score (0–100%) and personalized skill gap recommendations.
- **📋 End-to-End ATS Candidate Lifecycle:** 5-stage recruitment pipeline (`Applied` ➡️ `Under Review` ➡️ `Shortlisted` ➡️ `Interview` ➡️ `Offer Extended` / `Rejected`).
- **👨‍💼 Recruiter Evaluation Portal:** Hiring Managers and Admins can evaluate candidate resumes, preview cover notes, leave internal interview notes, and transition candidate pipeline stages in one click.
- **📄 Resume & Profile Persistence:** MySQL persistence for candidate headlines, experience, education, skills, and secure multipart PDF resume uploads.
- **🔔 Live Notifications & Alerts:** In-app notification center tracking application submission confirmations, recruiter stage updates, and interview invitations.
- **📊 Executive Analytics Dashboard:** Live platform KPIs (Total Jobs, Active Openings, Applications Received, Placement Rate) and visual ATS funnel conversion metrics.
- **🔖 Saved Jobs Manager:** Candidate bookmarking manager to save, organize, and quickly apply to positions across sessions.
- **🛡️ Enterprise Security:** Stateless JWT authentication stored in `HttpOnly` and `SameSite` cookies with refresh token rotation, BCrypt password hashing, and Spring Security method-level `@PreAuthorize` rules.
- **🧪 Comprehensive Test Suite:** Automated unit test suite using **JUnit 5 + Mockito** covering job services, application lifecycle, and the ATS scoring engine.
- **🚀 DevOps & CI/CD:** Multi-stage Docker containers with Docker Compose orchestration and automated GitHub Actions CI workflow.

---

## 📁 Enterprise Directory & Project Structure

```text
job-portal/
├── .github/workflows/ci.yml             # Automated CI/CD Pipeline (Maven + Vite + Docker)
├── backend/                             # Spring Boot 3.3.4 (Java 21) Maven Application
│   ├── src/main/java/com/jobportal/backend/
│   │   ├── config/                      # SecurityConfig, CorsConfig, AuditConfig, SwaggerConfig, DataSeeder
│   │   ├── controller/                  # REST Controllers:
│   │   │                                # - AuthController, JobController, ApplicationController,
│   │   │                                # - ProfileController, SavedJobController, ATSController,
│   │   │                                # - AnalyticsController, NotificationController
│   │   ├── service/                     # Service Layer & Impls:
│   │   │                                # - ApplicationService, CandidateProfileService, ATSScoringService,
│   │   │                                # - SavedJobService, AnalyticsService, NotificationService, JobService
│   │   ├── repository/                  # JPA Repositories (JobApplication, Profile, SavedJob, Notification, User, Job)
│   │   ├── dto/                         # Request & Response DTOs (ATSAnalysis, DashboardStats, ApplicationResponse)
│   │   ├── model/                       # Entities: User, Job, JobApplication, CandidateProfile, SavedJob, Notification
│   │   ├── security/                    # JWT Filters, TokenProvider, UserDetailsServiceImpl
│   │   └── exception/                   # GlobalExceptionHandler (@ControllerAdvice)
│   ├── src/test/java/                   # Automated Unit Tests (JobServiceTest, ApplicationServiceTest, ATSScoringServiceTest)
│   ├── pom.xml                          # Maven dependencies & plugins
│   └── Dockerfile                       # Multi-stage Docker build
│
├── frontend/                            # React.js + Vite Frontend
│   ├── src/
│   │   ├── api/                         # Axios REST clients (applicationApi, profileApi, savedJobApi, atsApi, analyticsApi)
│   │   ├── components/                  # Reusable UI (Navbar with Bell, Loader, Pagination, Modal, Toast)
│   │   ├── context/                     # AuthContext & RBAC state management
│   │   ├── features/
│   │   │   ├── auth/                    # Login & Register views
│   │   │   ├── jobs/                    # JobList (with ATS Scanner & Apply) & SavedJobs
│   │   │   ├── applications/            # MyApplications (with visual 5-stage progress tracker)
│   │   │   ├── recruiter/               # RecruiterApplications (Candidate ATS screening & stage updates)
│   │   │   ├── profile/                 # CandidateProfile (with DB sync & PDF resume upload)
│   │   │   └── dashboard/               # AdminDashboard (with live KPIs & ATS Funnel analytics)
│   │   ├── routes/                      # ProtectedRoute & AppRoutes (/jobs, /saved, /applications, /recruiter)
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── database/                            # MySQL Scripts
│   └── schema.sql                       # DB creation with Audit columns, Soft Delete & Seed data
├── .env.example                         # Environment variable template
├── docker-compose.yml                   # Docker orchestration (MySQL + Backend + Frontend)
└── README.md
```

---

## 🔐 Environment & Security Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Required variables:
   | Variable | Description |
   | :--- | :--- |
   | `DB_PASSWORD` | MySQL root database password |
   | `JWT_SECRET` | 256-bit Base64 secret key for token signing |
   | `DB_NAME` | Database name (`jobportal_db`) |
   | `VITE_API_BASE_URL` | Frontend REST endpoint (`http://localhost:8081/api`) |

---

## 🚀 Running the Project

### Option 1: Running with Maven & Vite Locally

1. **Database:**
   Ensure MySQL is running on `3306` with schema loaded from `database/schema.sql`.

2. **Backend Server (Spring Boot 3 + Java 21):**
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   *Runs at `http://localhost:8081` (Swagger docs at `http://localhost:8081/swagger-ui.html`)*

3. **Run Backend Test Suite:**
   ```bash
   cd backend
   .\mvnw.cmd test
   ```

4. **Frontend Server (Vite + React 18):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *UI runs at `http://localhost:5173/`*

---

### Option 2: Docker Compose Orchestration

```bash
docker-compose up --build
```
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://localhost:8081`
- **Swagger Docs:** `http://localhost:8081/swagger-ui.html`

---

## 👤 Default Seed Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@jobportal.com` | `Admin@123` | Full administrative control, system metrics, job creation & candidate evaluation |
| **Hiring Manager** | `manager@jobportal.com` | `Manager@123` | Recruiter ATS portal, candidate screening, stage promotion, and job posting |
| **Candidate** | `user@jobportal.com` | `User@123` | Job browsing, ATS fit scanner, one-click application, saved jobs, and profile |
