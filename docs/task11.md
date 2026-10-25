# Task 11: Docker Image and Container Lifecycle

## Objective and Scope

Build the CueCare frontend and API into a Docker image, run the application as a container, verify its health, and demonstrate the container lifecycle. Store SQLite data in a named Docker volume so it remains separate from the container filesystem.

## Container Configuration

The multi-stage `Dockerfile` builds the React/Vite client, then copies the production assets into the Node.js runtime image. Express serves the frontend and API from the same origin. The runtime uses a non-root user and includes a Docker health check for `/health`.

| Setting | Value |
|---|---|
| Image | `cuecare:task11` |
| Container | `cuecare-task11` |
| Host URL | `http://127.0.0.1:8082/` |
| Health endpoint | `http://127.0.0.1:8082/health` |
| Container port | `5000` |
| Persistent database path | `/app/data/cuecare.db` |
| Named volume | `cuecare_cuecare-data` |

`compose.yaml` configures the port mapping, environment, named volume, restart policy, and build context. `.dockerignore` excludes local dependencies, generated files, test output, and Git metadata from the build context.

## Build and Run

The following command built the image and started the container:

```powershell
docker compose up --build -d
```

The image built successfully as `cuecare:task11` (image ID `8bb985741ef1`). The container started and reached Docker health status `healthy`.

## Verification and Lifecycle

| Action | Result |
|---|---|
| Inspect Compose status | `cuecare-task11` was `Up (healthy)` with `8082` mapped to `5000`. |
| Check API health | `GET /health` returned `UP`, application `CueCare`, version `1.0.0`. |
| Check frontend | `GET /` returned HTTP `200`. |
| Read container logs | Express reported the server running on port `5000`. |
| Stop container | `docker compose stop` changed the container to `Exited`. |
| Start container | `docker compose start` returned it to `Up (healthy)`. |
| Check database volume | `/app/data/cuecare.db` exists, mounted from the named volume. |

The container is left running for Task 12. To inspect it later:

```powershell
docker compose ps
docker compose logs --tail 50
```

To stop and restart it:

```powershell
docker compose stop
docker compose start
```

To remove the container and network while keeping the database volume, use `docker compose down`. Do not add `-v` unless you intend to delete the persistent database volume.

## Evidence Screenshots

**[Insert Screenshot 1 here: Docker Desktop Containers view showing `cuecare-task11` running.]**

**[Insert Screenshot 2 here: Docker Desktop Images view showing `cuecare:task11`.]**

**[Optional Screenshot 3: PowerShell output showing `docker compose ps` healthy and the successful `/health` response.]**

## Deliverables

- Multi-stage Dockerfile for the client and API.
- Compose configuration for the image, container, port mapping, and persistent SQLite volume.
- Successful image build and healthy running container.
- Verified frontend, health endpoint, logs, stop/start lifecycle, and mounted database volume.
