# CueCare — Dockerfile
# This file will be completed in Task 11 (Docker Image and Container Lifecycle)

FROM eclipse-temurin:17-jre-alpine
LABEL maintainer="Nayan Pawar <23102A0012>"
LABEL org.opencontainers.image.title="cuecare"
LABEL org.opencontainers.image.description="Clinic Appointment Scheduling System"

WORKDIR /app

# Placeholder — full Dockerfile implemented in Task 11
COPY target/cuecare.war app.war

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.war"]
