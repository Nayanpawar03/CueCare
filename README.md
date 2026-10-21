# CueCare — Clinic Appointment Scheduling System

A full-stack clinic appointment scheduling web application built as part of a DevOps academic project. Patients can register, view available appointment slots, book appointments, receive confirmations, cancel bookings, and track appointment status.

---

## Student Details

| Field         | Value                  |
|---------------|------------------------|
| Name          | Nayan Pawar            |
| Roll Number   | 23102A0012             |
| Branch        | Computer Engineering   |
| Subject       | DevOps Lab             |
| Project Guide | Dr. Snehal Andhare     |

---

## MVP Features

1. **Patient Registration** — Register and manage patient profiles
2. **Availability / Slot View** — View available appointment slots by doctor and date
3. **Booking Request** — Book an appointment slot
4. **Confirmation** — Receive booking confirmation
5. **Cancellation** — Cancel an existing appointment
6. **Status Tracking** — Track the current status of an appointment

---

## Tech Stack

| Area                 | Technology                          |
|----------------------|-------------------------------------|
| Frontend             | React 18 + Vite + Bootstrap 5       |
| Backend              | Node.js + Express                   |
| Database             | SQLite (via better-sqlite3)         |
| Build Tool           | npm                                 |
| Version Control      | Git + GitHub                        |
| CI/CD                | Jenkins                             |
| Containerization     | Docker                              |
| Config Management    | Ansible                             |
| Testing              | Jest + Supertest (API), Selenium (UI)|

---

## Project Structure

```
CueCare/
├── client/                   ← React frontend (Vite)
│   ├── src/
│   │   ├── api/              ← Axios API calls
│   │   ├── components/       ← Shared components (Navbar, etc.)
│   │   ├── pages/            ← Page components
│   │   │   └── patients/     ← Patient Registration pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                   ← Node.js + Express backend
│   ├── src/
│   │   ├── db/               ← SQLite database setup
│   │   ├── routes/           ← Express route handlers
│   │   └── server.js         ← Application entry point
│   └── tests/                ← Jest + Supertest API tests
├── docs/                     ← Project documentation
├── .github/                  ← GitHub issue templates
├── Dockerfile
├── Jenkinsfile
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Nayanpawar03/CueCare.git
cd CueCare
```

### 2. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Run the application

Open two terminals:

```bash
# Terminal 1 — Backend (runs on port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (runs on port 5173)
cd client
npm run dev
```

### 4. Access the application

| URL                              | Purpose              |
|----------------------------------|----------------------|
| http://localhost:5173            | React frontend       |
| http://localhost:5000/health     | API health check     |
| http://localhost:5000/api/patients | Patients REST API  |

---

## Running Tests

```bash
# API tests (from server/)
cd server
npm test

# Production build (from client/)
cd client
npm run build
```

---

## Branching Strategy

| Branch           | Purpose                                  |
|------------------|------------------------------------------|
| `main`           | Single working branch (solo developer)   |
| `feature/<name>` | Used when demonstrating Git workflows    |

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit message conventions.
