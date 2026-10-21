# Task 10: Continuous Testing in Jenkins

## Objective and Scope

Integrate the CueCare Selenium WebDriver suite into the Jenkins Pipeline so each deployment is gated by the browser tests. Publish test reports and preserve failure screenshots. Verify the gate with a deliberate UI defect, correct it, and run the pipeline again.

## Pipeline Configuration

The Declarative Pipeline runs the Selenium UI tests after the application build and before packaging and deployment.

| Stage | Purpose | Failure behavior |
|---|---|---|
| Build | Installs server and client dependencies, runs server tests, and builds the client. | Stops the pipeline if a build step fails. |
| Selenium UI Tests | Runs the Maven suite using an isolated SQLite database and local API/client ports. | A nonzero Maven exit marks the pipeline failed; Package and Deploy are skipped. |
| Package | Creates and archives the release ZIP. | Runs only after the Selenium suite passes. |
| Deploy | Deploys the selected environment through Nginx. | Runs only after package creation. |

Jenkins records `tests/selenium/target/surefire-reports/TEST-*.xml` with its JUnit publisher. It archives the Surefire HTML report, XML/text results, and any PNG files created by the Selenium failure-screenshot extension.

The Maven command parameter uses the Windows agent Maven executable:

```text
C:\Users\Nayan\AppData\Local\Temp\apache-maven-3.9.16\bin\mvn.cmd
```

## Deliberate Defect and Failed Pipeline Run

The appointment list was deliberately changed to display `PENDING` when the actual status was `REQUESTED`. The appointment request, confirmation, and cancellation Selenium journeys assert the visible status, so the test stage detected the defect.

| Run | Change | Result |
|---|---|---|
| Jenkins build #5 | Deliberate appointment status-label defect | Failed at Selenium UI Tests. Package and Deploy were skipped. Jenkins recorded the test results and archived failure screenshots. |

**[Insert Screenshot 1 here: Jenkins build #5 console or stage view showing the failed Selenium UI Tests stage and the skipped Deploy stage.]**

## Defect Correction

The UI now maps the supported appointment statuses to their canonical labels: `REQUESTED`, `CONFIRMED`, and `CANCELLED`. The Selenium assertions pass with these labels.

| Commit | Description |
|---|---|
| `91bffe0` | `fix: preserve canonical appointment status labels` |

## Successful Rerun and Test Report

After the correction was pushed, Jenkins build #6 completed successfully. The Jenkins job shows a green result, the test-result trend is green, and the release archive `cuecare-dev-6.zip` is available. The local Maven verification also reported 5 tests passed, 0 failures, 0 errors, and 0 skipped.

**[Insert Screenshot 2 here: Jenkins CueCare-Pipeline overview showing successful build #6, green Test Result Trend, and `cuecare-dev-6.zip` under Last Successful Artifacts.]**

**[Insert Screenshot 3 here: Jenkins build #6 Test Result page showing the five passing Selenium tests.]**

## Deliverables

- Jenkins Selenium test stage and JUnit report publishing.
- Failed-pipeline evidence from build #5, with deployment blocked.
- Defect correction commit `91bffe0`.
- Successful Jenkins rerun in build #6 with the release package archived.
