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
| 8 | Pipeline as Code and server deployment | Complete — Jenkins Pipeline build #4 finished successfully; packaged artifact archived; parameterized `dev` deployment served through Nginx at `http://127.0.0.1:8081/`. |
| 9 | Selenium test design and local execution | Complete — five Maven Selenium journeys passed locally; Surefire HTML report and failure screenshot mechanism are in place. |
| 10 | Continuous testing in Jenkins | Complete — build #5 failed at Selenium tests and skipped deployment; defect correction `91bffe0` was pushed; build #6 passed and deployed. |
| 11 | Docker image and container lifecycle | Complete — `cuecare:task11` built; `cuecare-task11` ran healthy on port 8082; stop/start lifecycle and persistent SQLite volume verified. |
| 12 | Jenkins-Docker continuous deployment | In progress — Jenkinsfile builds a versioned image and deploys through Compose; local deployment verified at `http://127.0.0.1:8083/`; Jenkins service build pending. |
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
- Nginx 1.30.6 is extracted to `C:\nginx-1.30.6`; the Jenkins Pipeline job is configured from SCM with `Jenkinsfile`.
- Build #4 completed with `Finished: SUCCESS`; its console log confirms the Nginx `/health` check returned `UP` and reports the application URL `http://127.0.0.1:8081/`.
- Jenkins archived `artifacts/cuecare-dev-4.zip` for build #4. The parameter form captured `DEPLOY_ENV=dev`, `DEPLOY_ROOT=C:\CueCareDeploy`, and `NGINX_HOME=C:\nginx-1.30.6`.
- Browser evidence confirms the deployed CueCare home page loads at `http://127.0.0.1:8081/`.
- Added stage progress messages, Nginx configuration validation, separate Nginx logs, and an explicit successful PowerShell exit so Jenkins records deployment completion.

## Task 9 Selenium Progress Notes

- Added the Maven UI test project under `tests/selenium`, using Java 17, Selenium WebDriver, JUnit 5, and Surefire.
- Covered patient registration, invalid patient phone validation, appointment request, confirmation, and cancellation through the browser UI.
- The local runner creates an isolated SQLite database, starts the API and Vite server on dedicated ports, runs the Maven suite, and stops those test services afterward.
- Local run on 21 October 2026 completed with `BUILD SUCCESS`: 5 tests, 0 failures, 0 errors, and 0 skipped.
- Surefire report: `tests/selenium/target/site/surefire-report.html`; detailed results: `tests/selenium/target/surefire-reports/`.
- Failure screenshots are captured by the JUnit extension in `tests/selenium/target/screenshots/`; the mechanism was exercised during test setup, while the final clean run passed all journeys.

## Task 10 Continuous Testing Progress Notes

- Added a `Selenium UI Tests` stage between Build and Package in the Jenkins pipeline. A failed test exits the stage, so Package and Deploy do not run.
- The pipeline publishes Surefire XML results with Jenkins JUnit and archives the HTML report, Surefire reports, and failure screenshots on every run.
- Build #5 failed after the appointment status label was deliberately changed from `REQUESTED` to `PENDING`; its test report and failure screenshots were archived, and Deploy was skipped.
- Corrected the UI to display canonical appointment status labels in commit `91bffe0` (`fix: preserve canonical appointment status labels`).
- Build #6 completed successfully after the correction. Jenkins shows a green result, the test trend is green, and `cuecare-dev-6.zip` was archived.
- The same correction was verified locally with Maven: 5 tests passed, 0 failures, 0 errors, and 0 skipped.
