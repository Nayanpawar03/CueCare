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

The pipeline targets the Docker Desktop Linux engine over `npipe:////./pipe/dockerDesktopLinuxEngine`. The existing Task 11 container remains on port `8082`; Jenkins deploys `dev` on port `8083` and `staging` on port `8084`. The Compose project has a separate named SQLite volume for each environment.

## Local Deployment Check

The versioned image `cuecare:dev-11` built successfully. Running `scripts/deploy-docker.ps1` locally created container `cuecare-dev`, which became healthy. The deployed application returned HTTP `200` at `http://127.0.0.1:8083/`, and `/health` returned `UP`.

## Jenkins Run and Evidence

The Jenkins service runs as `LocalSystem`. Its Docker CLI and named-pipe access still need verification by running the updated `CueCare-Pipeline` job from Jenkins after this change is pushed.

**[Insert Screenshot 1 here: Jenkins build showing successful Docker Build and Docker Deploy stages.]**

**[Insert Screenshot 2 here: Jenkins console output showing the versioned image, healthy container, application URL, and health response.]**

**[Insert Screenshot 3 here: Docker Desktop Containers view showing the Jenkins-managed `cuecare-dev` container running.]**

## Deliverables

- Jenkins pipeline stages for versioned Docker image build and Compose deployment.
- Deployment script with health checks and environment-specific ports.
- Successful Jenkins run and archived release package (pending Jenkins execution).
- Deployed application URL and Docker container evidence (pending Jenkins execution).
