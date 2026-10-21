# CueCare Selenium Test Plan

## Test Plan

### Objective and Scope

The suite verifies five critical CueCare journeys through the browser: patient registration, patient input validation, appointment request, appointment confirmation, and appointment cancellation. The tests use the actual React pages and Express API, with a fresh isolated SQLite database for each local suite run.

### Tools

| Tool | Use |
|---|---|
| Selenium WebDriver 4 (Java) | Browser automation using Chrome and Selenium Manager. |
| JUnit 5 | Test structure and assertions. |
| Maven with Surefire | Compiles and runs the suite and produces text and XML reports. |
| Google Chrome | Headless browser by default; set `-Dapp.headless=false` to show the browser. |
| Java 17 or later | Compiles and runs the test project. |

### Test Environment

| Item | Value |
|---|---|
| Application under test | Local React development server and local Express API. |
| Browser base URL | `http://127.0.0.1:5174` (configurable with `-Dapp.baseUrl`). |
| API | `http://127.0.0.1:5101`, proxied by Vite. |
| Database | Isolated file `tests/selenium/target/selenium.sqlite`, recreated for each run. |
| Test project | `tests/selenium` (Maven project). |

### How to Run

From the repository root in PowerShell, run:

```powershell
.\tests\selenium\run-local.ps1
```

The script seeds the isolated test database, starts the API and Vite server, runs the Maven test suite, generates a Surefire report even when tests fail, then stops the test servers. It uses Maven from `PATH`, or detects the extracted Maven distribution under the Windows temporary folder. To run Maven directly while the local services are already available:

```powershell
mvn -f tests/selenium/pom.xml test surefire-report:report-only
```

### Test Data

| Data | Value |
|---|---|
| Patient | Unique `Selenium<sequence> Patient` name and `selenium.<sequence>@example.test` email for each test. |
| Phone | Valid 10-digit Indian mobile number; the validation test deliberately uses `123`. |
| Date of birth | Thirty years before the test date. |
| Doctors and slots | Two demo doctors and future 30-minute slots seeded into the isolated test database. |
| Appointment date | Next available seeded weekday; the seeder skips Sundays. |
| Appointment reason | Optional; omitted for the status workflow tests. |

### Critical User Journeys

| ID | Journey | Preconditions | Steps | Expected result |
|---|---|---|---|---|
| J1 | Register a patient (`PatientRegistrationTest`) | Local app is running. | Open the registration form, enter unique valid patient details, submit. | Redirects to the patient list; the new patient name and email appear. |
| J2 | Reject invalid patient data (`PatientValidationTest`) | Local app is running. | Enter valid details except an invalid phone number; submit. | Form remains open, phone field is marked invalid, and the 10-digit validation message appears. |
| J3 | Request an appointment (`AppointmentRequestTest`) | Demo doctor slots are seeded. | Register a patient in the UI, open appointments, select the patient, search the next seeded date, and request the first slot. | Success message appears and appointment status is `REQUESTED`. |
| J4 | Confirm an appointment (`AppointmentConfirmationTest`) | Demo doctor slots are seeded. | Register a patient, request a slot, and select **Confirm**. | Appointment status changes from `REQUESTED` to `CONFIRMED`. |
| J5 | Cancel an appointment (`AppointmentCancellationTest`) | Demo doctor slots are seeded. | Register a patient, request a slot, and select **Cancel**. | Appointment status changes to `CANCELLED`. |

## Selenium Scripts

The Maven project is in `tests/selenium`. It uses page objects for patient and appointment interactions, explicit waits, and a fresh Chrome browser per test. Each appointment test registers its own unique patient through the browser before booking; assertions are performed against the visible application UI.

| Path | Purpose |
|---|---|
| `src/test/java/com/cuecare/config/TestConfig.java` | Reads the base URL and headless setting. |
| `src/test/java/com/cuecare/base/BaseTest.java` | Creates and closes Chrome for each test and saves failure screenshots. |
| `src/test/java/com/cuecare/base/ScreenshotOnFailureExtension.java` | Captures a screenshot when a test assertion or step fails. |
| `src/test/java/com/cuecare/util/TestData.java` | Generates unique patient data and seeded appointment dates. |
| `src/test/java/com/cuecare/util/TestPatient.java` | Holds generated patient details used by the tests. |
| `src/test/java/com/cuecare/pages/PatientFormPage.java` | Patient registration form actions. |
| `src/test/java/com/cuecare/pages/AppointmentPage.java` | Appointment request and status actions. |
| `src/test/java/com/cuecare/tests/` | The five JUnit journey tests listed above. |

## Local Test Report

The suite is run locally through Maven with `mvn -f tests/selenium/pom.xml test`. Results are written to `tests/selenium/target/surefire-reports/`; the HTML summary is `tests/selenium/target/site/surefire-report.html`.

**Local execution result (21 October 2026):** `BUILD SUCCESS`; 5 tests run, 0 failures, 0 errors, and 0 skipped. The five test classes each passed (one test per class). The Maven Surefire HTML report and XML/text reports were generated successfully.

**[Insert Screenshot 1 here: PowerShell/Maven output showing `Tests run: 5, Failures: 0, Errors: 0, Skipped: 0` and `BUILD SUCCESS`.]**

## Failure Screenshot Mechanism

### How It Works

`ScreenshotOnFailureExtension` handles a test exception while the browser is still open. It captures the current page as a PNG, prints the screenshot path in the Maven output, and rethrows the original exception so Surefire reports the test as failed.

| Item | Value |
|---|---|
| Folder | `tests/selenium/target/screenshots/` |
| File name | `<TestClass>_<testMethod>_<yyyyMMdd-HHmmss>.png` |
| Ignored by Git | Yes; Maven `target/` output is ignored. |

The extension was exercised during development when the patient date-of-birth input assertion failed. The saved image shows the invalid date and browser validation message; this input issue was fixed afterward. The final passing run does not create new failure screenshots.

**[Insert Screenshot 2 here: `tests/selenium/target/screenshots/AppointmentCancellationTest_cancelsRequestedAppointmentAndShowsCancelledStatus_20261021-181333.png`. Label it as a failure-capture demonstration from test setup; the captured date-input issue was fixed, and the final suite passes.]**
