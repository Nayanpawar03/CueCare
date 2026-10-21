# CueCare Product Backlog

This backlog tracks the clinic appointment MVP and the DevOps assignment work. Status reflects work completed in the repository and evidence available at the time of update.

## MVP Backlog — Task 6

| ID | Priority | Backlog item | Acceptance criteria | Status |
|----|----------|--------------|---------------------|--------|
| MVP-01 | High | Register and manage patients | A patient can be registered and appears in the patient list. | Complete — Task 5; browser verified. |
| MVP-02 | High | View doctors and available appointment slots | A patient can search future slots by date and doctor; occupied slots are excluded. | Implemented — API tests and client build passed. |
| MVP-03 | High | Submit an appointment request | A registered patient can request an available slot; duplicate active bookings are rejected. | Implemented — API tests passed. |
| MVP-04 | High | Confirm an appointment request | A requested appointment can be confirmed and its status is displayed. | Implemented — API tests passed. |
| MVP-05 | High | Cancel an appointment | A requested or confirmed appointment can be cancelled; its slot becomes available again. | Implemented — API tests passed. |
| MVP-06 | High | Track appointment status | A patient can view appointment date, doctor, and REQUESTED, CONFIRMED, or CANCELLED status. | Implemented — API tests and browser workflow verified. |
| MVP-07 | High | Demonstrate Git collaboration and prepare a release baseline | Complete the second feature branch workflow, create and resolve a documented merge conflict, create a version tag, and verify a clean release-ready source baseline. | Complete — conflict resolved; `v1.0.0` tagged; Task 6 PR #2 merged into `develop`. |

## Upcoming DevOps Assignment Work

| Task | Work item | Status |
|-------|-----------|--------|
| 7 | Jenkins installation and continuous integration job | Complete — Jenkins `CueCare-CI` built successfully; scheduled SCM polling triggered build #2; frontend artifacts archived. |
| 8 | Pipeline as Code and server deployment | In progress — Jenkinsfile, package stage, and parameterized Nginx deployment script prepared; Nginx setup and successful pipeline run pending. |
| 9 | Selenium test design and local execution | Not started |
| 10 | Continuous testing in Jenkins | Not started |
| 11 | Docker image and container lifecycle | Not started |
| 12 | Jenkins-Docker continuous deployment | Not started |
| 13 | Configuration management script | Not started |
| 14 | Automated provisioning and reliability validation | Not started |
| 15 | End-to-end release, documentation, and viva | Not started |

## Task 6 Verification Notes

- Appointment API tests: 15 passed.
- Client production build: passed.
- Appointment workflow: exercised in the browser; request and status display were observed.
- Git collaboration conflict resolved in commit `4074e5f`; `v1.0.0` points to that source baseline, which is included in `develop`.
- Task 6 PR #2 merged into `develop`.

## Git Collaboration Evidence

- An add/add conflict was created by competing Task 6 backlog files and resolved by retaining the complete MVP backlog from feature/appointment-booking.

## Task 7 CI Progress Notes

- Jenkins 2.580.1 is installed locally and configured at `http://localhost:8080`.
- The `CueCare-CI` Freestyle job checks out `develop`, polls GitHub every five minutes, runs the Ant `ci` target, and archives `client/dist/**`.
- Build #1 completed successfully and archived `index.html`, CSS, and JavaScript artifacts; it was started manually.
- Build #2 completed successfully after the five-minute SCM polling interval, providing the scheduled-trigger evidence; it also archived the frontend artifacts.
- Build logs show the Ant `ci` target completed with `BUILD SUCCESSFUL` and Jenkins finished with `SUCCESS`.

## Task 8 Pipeline Progress Notes

- Replaced the starter `Jenkinsfile` with Declarative Pipeline stages for checkout, build and test, package, and deployment.
- Added `DEPLOY_ENV` (`dev` or `staging`), `DEPLOY_ROOT`, and `NGINX_HOME` parameters.
- Added a Windows deployment script that stages the React build and Express API, keeps SQLite data in a shared folder, seeds demo appointment slots, configures Nginx, and checks the deployed `/health` endpoint.
- Pending: extract the official Windows Nginx distribution to `C:\nginx`, create a Jenkins Pipeline job pointing to `Jenkinsfile`, and capture a successful deployment run and browser evidence.
