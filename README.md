# CueCare — Clinic Appointment Scheduling System

A web-based clinic appointment scheduling system built as part of a DevOps academic project.
The application allows patients to register, view available appointment slots, book appointments,
receive confirmations, cancel bookings, and track appointment status.

---

## Student Details

| Field          | Value                                      |
|----------------|--------------------------------------------|
| Name           | Nayan Pawar                                |
| Roll Number    | 23102A0012                                 |
| Branch         | Computer Engineering                       |
| Subject        | DevOps Lab                                 |
| Project Guide  | Dr. Snehal Andhare                         |

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

| Area                  | Technology                        |
|-----------------------|-----------------------------------|
| Language / Runtime    | Java 17                           |
| Backend Framework     | Spring Boot 3                     |
| Build Tool            | Maven (via Maven Wrapper)         |
| Database              | H2 (development), MySQL (prod)    |
| Frontend              | Thymeleaf + Bootstrap 5           |
| Deployment Target     | Tomcat (embedded) / Nginx         |
| Version Control       | Git + GitHub                      |
| CI/CD                 | Jenkins                           |
| Containerization      | Docker                            |
| Config Management     | Ansible                           |
| Testing               | JUnit 5, Selenium WebDriver       |

---

## Getting Started

### Prerequisites

- Java 17 or higher
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Nayanpawar03/CueCare.git
cd CueCare

# Run using Maven Wrapper (downloads Maven automatically)
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows

# Access the application
http://localhost:8080
http://localhost:8080/health
```

---

## Project Structure

```
CueCare/
├── .github/
│   └── ISSUE_TEMPLATE/       # GitHub issue templates
├── docs/                     # Project documentation
├── src/
│   ├── main/
│   │   ├── java/com/cuecare/
│   │   │   ├── controller/   # MVC controllers
│   │   │   ├── model/        # JPA entities
│   │   │   ├── repository/   # Spring Data repositories
│   │   │   ├── service/      # Business logic
│   │   │   └── CueCareApplication.java
│   │   └── resources/
│   │       ├── templates/    # Thymeleaf HTML templates
│   │       ├── static/       # CSS, JS, images
│   │       └── application.properties
│   └── test/                 # JUnit tests
├── Dockerfile
├── Jenkinsfile
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## Branching Strategy

| Branch              | Purpose                                    |
|---------------------|--------------------------------------------|
| `main`              | Stable, release-ready code only            |
| `develop`           | Integration branch; built by Jenkins       |
| `feature/<name>`    | One feature per branch, merged via PR      |
| `bugfix/<name>`     | One bug fix per branch, merged via PR      |
| `release/<version>` | Release preparation branch                 |

See [CONTRIBUTING.md](CONTRIBUTING.md) for full branching and commit message rules.

---

## Running Tests

```bash
./mvnw test           # Run all unit tests
./mvnw verify         # Run all tests including integration
```
