# ⚡ Job Portal Enterprise Architecture
> Spring Boot Reactor + Vite React Enterprise Reference Architecture (RBAC: ADMIN, MANAGER, EMPLOYEE, USER | JWT HttpOnly)

---

## 📁 Enterprise Directory & Project Structure

```text
job-portal/
├── backend/                             # Spring Boot 3.3.4 (Java 21) Maven Application
│   ├── src/main/java/com/jobportal/backend/
│   │   ├── config/                      # SecurityConfig, CorsConfig, AuditConfig, SwaggerConfig, DataSeeder
│   │   ├── controller/                  # REST Controllers (AuthController, JobController)
│   │   ├── service/                     # Service Layer & Impls (AuthService, JobService)
│   │   ├── repository/                  # JPA Repositories (UserRepository, JobRepository, RefreshTokenRepository)
│   │   ├── dto/                         # Request & Response DTOs
│   │   ├── model/                       # JPA Entities with Audit & Soft Delete (User, Job, RefreshToken)
│   │   ├── security/                    # JWT Filters, TokenProvider, UserDetailsServiceImpl
│   │   └── exception/                   # GlobalExceptionHandler (@ControllerAdvice)
│   ├── pom.xml                          # Maven dependencies & plugins
│   └── Dockerfile                       # Multi-stage Docker build
│
├── frontend/                            # React.js + Vite Frontend
│   ├── src/
│   │   ├── api/                         # Axios client with withCredentials & Interceptors (Port 8081)
│   │   ├── components/                  # Reusable UI (DataTable, Pagination, Modal, Loader, Toast)
│   │   ├── context/                     # AuthContext & RBAC state management
│   │   ├── features/                    # Modular feature views (auth/, jobs/, dashboard/)
│   │   ├── routes/                      # ProtectedRoute & AppRoutes
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── database/                            # MySQL Scripts
│   └── schema.sql                       # DB creation with Audit columns, Soft Delete & Seed data
├── .env.example                         # Environment variable template
├── docker-compose.yml                   # Docker orchestration (MySQL + Backend + Frontend)
├── .gitignore                           # Excludes target/, node_modules/, secrets & .env
└── README.md
```

---

## 🔐 Environment & Security Setup

Before running the application or starting Docker Compose, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 🔑 How to Generate a Unique Random JWT Secret

Your `JWT_SECRET` must be a strong 256-bit (32-byte) key. You can generate one using any of the following commands:

- **Linux / macOS / Git Bash:**
  ```bash
  openssl rand -base64 32
  ```

- **PowerShell (Windows):**
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
  ```

---

### ⚙️ Required Environment Variables

| Variable | Description | Required in Docker Compose? |
| :--- | :--- | :--- |
| `DB_PASSWORD` | MySQL Database Password | **Required** (No silent fallback) |
| `JWT_SECRET` | 256-bit Secret Key for JWT Tokens | **Required** (No silent fallback) |
| `DB_USERNAME` | MySQL Username | Optional (Default: `root`) |
| `DB_NAME` | MySQL Database Name | Optional (Default: `jobportal_db`) |
| `VITE_API_BASE_URL` | Frontend REST API URL | Optional (Default: `http://localhost:8081/api`) |

> [!IMPORTANT]
> Both `DB_PASSWORD` and `JWT_SECRET` must be set in your `.env` file or environment when using Docker Compose. If either is missing, Docker Compose will halt with an explicit error.

---

## 🚀 How to Run the Application

### Option 1: Docker Compose (Strict Security Mode)
1. Ensure `.env` is created and populated with `DB_PASSWORD` and `JWT_SECRET`:
   ```bash
   cp .env.example .env
   # Edit .env to set your DB_PASSWORD and generated JWT_SECRET
   ```
2. Start containers:
   ```bash
   docker-compose up --build
   ```
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://localhost:8081`
- **Swagger Docs:** `http://localhost:8081/swagger-ui.html`

---

### Option 2: Running Locally with MySQL

1. **Database Setup:**
   Ensure MySQL is running on port `3306` and load the schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Backend Server (Spring Boot):**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Frontend Server (Vite + React):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *UI runs at `http://localhost:5173/`.*
