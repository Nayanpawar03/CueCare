const request = require('supertest');

process.env.DB_PATH = ':memory:';

const app = require('../src/server');
const db = require('../src/db/database');

describe('Appointment API', () => {
    let patientId;
    let doctorId;
    let slotId;
    let appointmentDate;

    beforeEach(() => {
        db.prepare('DELETE FROM appointments').run();
        db.prepare('DELETE FROM appointment_slots').run();
        db.prepare('DELETE FROM doctors').run();
        db.prepare('DELETE FROM patients').run();

        const patient = db.prepare(`
            INSERT INTO patients
                (first_name, last_name, email, phone, date_of_birth, gender)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Test', 'Patient', 'appointment-test@example.com', '9876543210', '1990-01-01', 'Other');
        patientId = patient.lastInsertRowid;

        const doctor = db.prepare(
            'INSERT INTO doctors (name, specialty) VALUES (?, ?)'
        ).run('Dr. Test', 'General Medicine');
        doctorId = doctor.lastInsertRowid;

        const date = new Date();
        date.setDate(date.getDate() + 2);
        appointmentDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-');

        const slot = db.prepare(`
            INSERT INTO appointment_slots
                (doctor_id, appointment_date, start_time, end_time)
            VALUES (?, ?, ?, ?)
        `).run(doctorId, appointmentDate, '09:00', '09:30');
        slotId = slot.lastInsertRowid;
    });

    test('GET /api/appointments/doctors lists active doctors', async () => {
        const res = await request(app).get('/api/appointments/doctors');
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].name).toBe('Dr. Test');
    });

    test('GET /api/appointments/slots returns available future slots', async () => {
        const res = await request(app)
            .get('/api/appointments/slots')
            .query({ date: appointmentDate, doctorId });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].id).toBe(slotId);
    });

    test('booking can be requested, confirmed, tracked, and cancelled', async () => {
        const booking = await request(app).post('/api/appointments').send({
            patientId,
            slotId,
            reason: 'Routine checkup',
        });

        expect(booking.statusCode).toBe(201);
        expect(booking.body.data.status).toBe('REQUESTED');
        const appointmentId = booking.body.data.id;

        const confirm = await request(app).patch(`/api/appointments/${appointmentId}/confirm`);
        expect(confirm.statusCode).toBe(200);
        expect(confirm.body.data.status).toBe('CONFIRMED');

        const status = await request(app).get(`/api/appointments/${appointmentId}`);
        expect(status.statusCode).toBe(200);
        expect(status.body.data.status).toBe('CONFIRMED');

        const cancel = await request(app).patch(`/api/appointments/${appointmentId}/cancel`);
        expect(cancel.statusCode).toBe(200);
        expect(cancel.body.data.status).toBe('CANCELLED');

        const available = await request(app)
            .get('/api/appointments/slots')
            .query({ date: appointmentDate, doctorId });
        expect(available.body.count).toBe(1);
    });

    test('a slot cannot have two active appointment requests', async () => {
        await request(app).post('/api/appointments').send({ patientId, slotId });
        const duplicate = await request(app).post('/api/appointments').send({ patientId, slotId });

        expect(duplicate.statusCode).toBe(409);
        expect(duplicate.body.message).toContain('no longer available');
    });

    test('booking rejects invalid input and unknown patients', async () => {
        const invalid = await request(app).post('/api/appointments').send({ patientId: 0, slotId });
        expect(invalid.statusCode).toBe(400);

        const missingPatient = await request(app).post('/api/appointments').send({ patientId: 9999, slotId });
        expect(missingPatient.statusCode).toBe(404);
    });

    test('GET /api/appointments/patient/:patientId returns the patient appointments', async () => {
        await request(app).post('/api/appointments').send({ patientId, slotId });
        const res = await request(app).get(`/api/appointments/patient/${patientId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].doctor_name).toBe('Dr. Test');
    });
});
