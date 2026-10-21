const request = require('supertest');
const app = require('../src/server');

// Use a separate in-memory test DB so we don't touch development data
process.env.DB_PATH = ':memory:';

describe('Patient API', () => {

    const validPatient = {
        firstName: 'Nayan',
        lastName: 'Pawar',
        email: 'nayan@example.com',
        phone: '9876543210',
        dateOfBirth: '2000-05-15',
        gender: 'Male',
        address: 'Pune, Maharashtra'
    };

    // ── Health check ────────────────────────────────────────────────────────────

    test('GET /health returns UP', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('UP');
    });

    // ── GET all patients ────────────────────────────────────────────────────────

    test('GET /api/patients returns empty list initially', async () => {
        const res = await request(app).get('/api/patients');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // ── POST — register new patient ─────────────────────────────────────────────

    test('POST /api/patients registers a valid patient', async () => {
        const res = await request(app).post('/api/patients').send(validPatient);
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.first_name).toBe('Nayan');
        expect(res.body.data.email).toBe('nayan@example.com');
    });

    test('POST /api/patients rejects duplicate email', async () => {
        await request(app).post('/api/patients').send(validPatient);
        const res = await request(app).post('/api/patients').send(validPatient);
        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('already registered');
    });

    test('POST /api/patients rejects empty first name', async () => {
        const res = await request(app).post('/api/patients').send({
            ...validPatient,
            firstName: ''
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe('First name is required');
    });

    test('POST /api/patients rejects invalid phone number', async () => {
        const res = await request(app).post('/api/patients').send({
            ...validPatient,
            email: 'other@example.com',
            phone: '1234'
        });
        expect(res.statusCode).toBe(400);
    });

    test('POST /api/patients rejects invalid email', async () => {
        const res = await request(app).post('/api/patients').send({
            ...validPatient,
            email: 'not-an-email'
        });
        expect(res.statusCode).toBe(400);
    });

    // ── GET by ID ───────────────────────────────────────────────────────────────

    test('GET /api/patients/:id returns the patient', async () => {
        const post = await request(app).post('/api/patients').send({
            ...validPatient, email: 'get-test@example.com'
        });
        const id = post.body.data.id;
        const res = await request(app).get(`/api/patients/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.id).toBe(id);
    });

    test('GET /api/patients/:id returns 404 for unknown ID', async () => {
        const res = await request(app).get('/api/patients/99999');
        expect(res.statusCode).toBe(404);
    });

});
