const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'UP', application: 'CueCare', version: '1.0.0' });
});

// In the Docker image the built React app is served by this same process.
// Local development continues to use the separate Vite dev server.
const frontendDirectory = path.join(__dirname, '..', 'public');
const frontendIndex = path.join(frontendDirectory, 'index.html');
if (fs.existsSync(frontendIndex)) {
    app.use(express.static(frontendDirectory));
    app.get(/^(?!\/api\/).*/, (req, res) => {
        res.sendFile(frontendIndex);
    });
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CueCare server running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

module.exports = app;
