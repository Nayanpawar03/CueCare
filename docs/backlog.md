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
| MVP-07 | High | Demonstrate Git collaboration and prepare a release baseline | Complete the second feature branch workflow, create and resolve a documented merge conflict, create a version tag, and verify a clean release-ready source baseline. | In progress. |

## Upcoming DevOps Assignment Work

| Task | Work item | Status |
|-------|-----------|--------|
| 7 | Jenkins installation and continuous integration job | Not started |
| 8 | Pipeline as Code and server deployment | Not started |
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
- Release and collaboration evidence: pending until the conflict resolution and tag are completed.

## Git Collaboration Evidence

- An add/add conflict was created by competing Task 6 backlog files and resolved by retaining the complete MVP backlog from feature/appointment-booking.
