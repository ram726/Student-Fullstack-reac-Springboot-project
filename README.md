# SimpleStudentCRUDProject

This repository contains a simple Student CRUD application with a Java Spring Boot backend and a React frontend.

This README documents how to build, run, test, and deploy both parts, plus API details, data shapes, and notes for working on a git branch.

## Table of contents

- Project structure
- Quick start (dev)
- Backend (Spring Boot)
  - Requirements
  - Configuration
  - Build & run
  - Tests
  - API endpoints
  - Data model
  - File upload rules
- Frontend (React)
  - Requirements
  - Scripts
  - Configuration
  - How it talks to backend
- Working on a Git branch
- Troubleshooting
- Next steps / improvements

## Project structure

Top-level folders:

- `backend/` — Spring Boot application (Maven)
- `frontend/stufront/` — React SPA created with Create React App

Backend key files:

- `backend/src/main/java/com/ram/student/backend/controller/StudentController.java` — REST controller exposing student endpoints.
- `backend/src/main/java/com/ram/student/backend/model/Student.java` — JPA entity for Student.
- `backend/src/main/resources/application.properties` — application configuration (DB, server port, JPA).

Frontend key files:

- `frontend/stufront/src/` — React source
- `frontend/stufront/src/users/` — pages for Add/Edit/View users
- `frontend/stufront/package.json` — scripts and dependencies

## Quick start (development)

Prerequisites (recommended):

- Java 17+ (project uses modern Java; any JDK 17+ compatible should work). The environment used in this repo shows JDK 24 but JDK 17+ is fine.
- Maven 3.6+
- Node.js 18+ and npm
- MySQL or compatible database (or adjust datasource to use H2 for quick local dev)

1) Start the backend

- Create a database named `studentdb` (or update `application.properties` to point to your DB):

  - URL: `jdbc:mysql://localhost:3306/studentdb`
  - username: `root`
  - password: `root`

- From the repo root run (Windows PowerShell):

```powershell
cd backend
./mvnw spring-boot:run
```

This starts the backend on port 8080 (configurable in `application.properties`). The packaged jar is available at `backend/target/backend-0.0.1-SNAPSHOT.jar`.

2) Start the frontend

```powershell
cd frontend/stufront
npm install
npm start
```

This starts the React dev server on port 3000. The frontend is configured to allow CORS from the backend controller (`@CrossOrigin(origins = "http://localhost:3000")`).

## Backend (Spring Boot)

Requirements

- Java 11+ (project ran with modern JDK; use a stable LTS such as Java 17)
- Maven
- MySQL (or change datasource to H2 for in-memory testing)

Configuration

See `backend/src/main/resources/application.properties` — relevant values:

- `spring.datasource.url=jdbc:mysql://localhost:3306/studentdb`
- `spring.datasource.username=root`
- `spring.datasource.password=root`
- `server.port=8080`

You can override these with environment variables or command-line properties:

```powershell
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8090
```

Build & run

- Build jar:

```powershell
cd backend
./mvnw clean package
```

- Run jar:

```powershell
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Tests

- Unit tests are in `backend/src/test`. Run them with:

```powershell
cd backend
./mvnw test
```

API endpoints

Base path: `/student`

- POST `/student/add` — Create a student (multipart/form-data)
  - Accepts a `student` JSON part and an optional `photo` file part.
  - Returns 201 Created with saved Student JSON.

- GET `/student/search/id/{studentId}` — Get student by studentId (path variable)

- GET `/student/search?name=&phone=&email=` — Search students by optional query params (any combination)

- PUT `/student/update/{studentId}` — Update student (multipart/form-data)
  - Accepts `student` JSON part and optional `photo` file part.

- DELETE `/student/delete/{studentId}` — Delete a student by studentId.

- GET `/student/all` — List all students.

- GET `/student/photo/{studentId}` — Get the stored photo for student (returns image bytes with correct content-type)

- DELETE `/student/photo/{studentId}` — Remove the stored photo.

Notes about file uploads

- The controller enforces server-side validation for photo uploads:
  - Allowed content types: `image/jpeg`, `image/png`, `image/gif`.
  - Max upload size enforced in controller: 2 MB.
  - The `student` object must be supplied as a request part named `student` (JSON). The controller expects multipart/form-data with a JSON part and an optional file part named `photo`.

Data model

Entity: `Student` (fields)

- `id` (Long) — internal DB id (generated)
- `studentId` (String) — public student identifier used in endpoints
- `studentName` (String)
- `studentCity` (String)
- `studentPhone` (Long)
- `studentEmail` (String)
- `photo` (byte[]) — stored as LOB (not serialized by default)
- `photoContentType` (String) — MIME type of photo
- `photoFileName` (String)
- `createdAt`, `updatedAt` (LocalDateTime) — auto-populated via JPA lifecycle callbacks

Error handling

- The project includes a `GlobalExceptionHandler` (`@ControllerAdvice`) to map server errors to appropriate HTTP responses. The controller also throws `ResponseStatusException` for invalid uploads.

## Frontend (React)

Requirements

- Node.js (>=18 recommended) and npm

Scripts (in `frontend/stufront/package.json`)

- `npm start` — launches dev server (react-scripts) on port 3000
- `npm run build` — creates production build in `frontend/stufront/build`
- `npm test` — run tests

Dependencies of note

- `axios` — used for HTTP requests to backend
- `react-router-dom` — routing
- `bootstrap` — UI styles

How the frontend talks to backend

- The backend controller is annotated with `@CrossOrigin(origins = "http://localhost:3000")` allowing the React dev server (port 3000) to call the API on port 8080.
- Look for HTTP client code in `frontend/stufront/src/services/axiosConfig.js` and `frontend/stufront/src/services/notificationService.js`.

Production build and serving

- Build the frontend:

```powershell
cd frontend/stufront
npm run build
```

- The static build artifacts appear in `frontend/stufront/build/`. You can serve these with any static web server, or place them on the Spring Boot classpath under `backend/src/main/resources/static` and serve from the backend.

If you prefer serving the built frontend from the backend:

1. Copy the build output into `backend/src/main/resources/static/` (or configure Maven to do this as part of packaging).
2. Rebuild backend jar and run; the SPA will be served by Spring Boot.

## Working on a Git branch

When creating a branch for new work, follow these recommendations:

- Create a feature branch off `main` (or the team's trunk branch):

```powershell
git checkout -b feature/<short-description>
```

- Keep commits small and focused. Use meaningful commit messages.
- If you change backend configuration (DB credentials, ports), avoid committing secrets. Use `application.properties` templates and environment-specific overlays.

Merging back

- Rebase/merge frequently to keep your branch up-to-date with `main`.
- Add tests for backend changes (unit + integration) and run `./mvnw test` before merging.

Branch checklist before PR

- All tests pass (backend & frontend where applicable).
- Linting/formatting applied.
- No hard-coded secrets or local-only config.
- Update README with any environment or new endpoints.

## Troubleshooting

- If the backend fails to start due to DB connection:
  - Ensure MySQL server is running and `studentdb` exists.
  - Check `spring.datasource.*` properties.

- If CORS errors happen in the browser:
  - Verify the React dev server is running on `http://localhost:3000`.
  - Confirm `@CrossOrigin` is configured on controllers or use a global CORS filter during development.

- If file uploads fail with 400/413:
  - Ensure the file is under 2 MB and is one of allowed types (`jpeg`, `png`, `gif`).

## Next steps / improvements

- Add OpenAPI/Swagger documentation for API.
- Add frontend environment config to easily switch backend base URL.
- Add integration tests for controller endpoints (MockMvc) and E2E tests for the frontend (Cypress/Playwright).
- Add Dockerfile for backend and Docker Compose to bring up backend + MySQL + frontend.

## Verification

- I validated the backend endpoints and data model by inspecting `StudentController.java` and `Student.java`.
- I inspected `application.properties` for DB and server configuration.
- I inspected `frontend/stufront/package.json` for scripts and dependencies.

If you want, I can:
