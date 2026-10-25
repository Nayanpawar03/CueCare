# Build the React/Vite frontend.
FROM node:20-bookworm-slim AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Run the API and serve the built frontend from the same origin.
FROM node:20-bookworm-slim AS runtime
LABEL org.opencontainers.image.title="cuecare"
LABEL org.opencontainers.image.description="Clinic Appointment Scheduling System"

ENV NODE_ENV=production \
    PORT=5000 \
    DB_PATH=/app/data/cuecare.db

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY --from=client-build /build/client/dist ./public

RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 5000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
