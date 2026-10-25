# Task 12: Jenkins-Docker Continuous Deployment

## Objective and Scope

Extend `CueCare-Pipeline` to build a versioned Docker image after the existing API and Selenium checks, deploy it with Docker Compose, and confirm that both the application and its health endpoint respond.

## Pipeline Configuration

The Jenkins pipeline now has the following delivery order:

| Stage | Purpose |
|---|---|
| Checkout | Checks out the configured Git revision. |
| Build | Installs dependencies, runs API tests, and builds the frontend. |
| Selenium UI Tests | Runs the browser suite; failure blocks packaging and deployment. |
| Package | Creates and archives the release ZIP. |
| Docker Build | Builds `cuecare:<environment>-<build number>` using the Docker Desktop engine. |
| Docker Deploy | Recreates the environment container through Compose and waits for Docker health plus HTTP health checks. |

The `DOCKER_CLI` parameter points Jenkins to the local Docker CLI:

```text
C:\Users\Nayan\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe
```

The pipeline targets the Docker Desktop Linux engine over `npipe:////./pipe/dockerDesktopLinuxEngine`. Since Jenkins runs as `LocalSystem`, the deployment script invokes Docker Desktop's standalone `docker-compose.exe` beside `docker.exe` rather than relying on the interactive user's Docker CLI plugin configuration. The existing Task 11 container remains on port `8082`; Jenkins deploys `dev` on port `8083` and `staging` on port `8084`. The Compose project has a separate named SQLite volume for each environment.

## Local Deployment Check

The versioned image `cuecare:dev-11` built successfully. Running `scripts/deploy-docker.ps1` locally created container `cuecare-dev`, which became healthy. The deployed application returned HTTP `200` at `http://127.0.0.1:8083/`, and `/health` returned `UP`.

## Jenkins Run and Evidence

The Jenkins service runs as `LocalSystem`. The first Jenkins attempt built the Docker image but failed when it tried to find Docker Compose through the user-profile plugin configuration. The deployment script was updated to use the standalone Compose executable. Jenkins build #8 then completed successfully after the Task 10 Selenium tests passed.

| Run detail | Result |
|---|---|
| Jenkins build | #8 — `Finished: SUCCESS` |
| Docker image | `cuecare:dev-8` |
| Container | `cuecare-dev` — healthy |
| Application URL | `http://127.0.0.1:8083/` |
| Health check | `http://127.0.0.1:8083/health` returned `UP` |

The pipeline's Package stage archives the versioned ZIP. Jenkins post actions recorded the JUnit results and archived artifacts after deployment.

**[Insert Screenshot 1 here: Jenkins build showing successful Docker Build and Docker Deploy stages.]**

**[Insert Screenshot 2 here: Jenkins build #8 console output showing `cuecare:dev-8`, healthy container, application URL, health response, and `Finished: SUCCESS`.]**

**[Insert Screenshot 3 here: Docker Desktop Containers view showing the Jenkins-managed `cuecare-dev` container running.]**

## Deliverables

- Jenkins pipeline stages for versioned Docker image build and Compose deployment.
- Deployment script with health checks and environment-specific ports.
- Successful Jenkins build #8 after the Selenium test stage.
- Healthy Docker deployment at `http://127.0.0.1:8083/` with health endpoint returning `UP`.
- Archived release ZIP and Docker container evidence.
