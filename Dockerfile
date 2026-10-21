# CueCare — Dockerfile
# Full implementation in Task 11 (Docker Image and Container Lifecycle)
# Stack: Node.js + React (served as static files by Express)

FROM node:18-alpine
LABEL maintainer="Nayan Pawar <23102A0012>"
LABEL org.opencontainers.image.title="cuecare"
LABEL org.opencontainers.image.description="Clinic Appointment Scheduling System"

WORKDIR /app

# Placeholder — full Dockerfile implemented in Task 11
EXPOSE 5000

CMD ["node", "server/src/server.js"]
