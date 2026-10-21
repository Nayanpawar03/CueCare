const express = require('express');
const {
    body,
    param,
    query,
    validationResult,
} = require('express-validator');
const db = require('../db/database');

const router = express.Router();

function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}

function getAppointment(id) {
    return db.prepare(`
        SELECT a.id, a.patient_id, a.slot_id, a.status, a.reason,
               a.requested_at, a.updated_at,
               s.appointment_date, s.start_time, s.end_time,
               d.id AS doctor_id, d.name AS doctor_name, d.specialty
        FROM appointments a
        JOIN appointment_slots s ON s.id = a.slot_id
        JOIN doctors d ON d.id = s.doctor_id
        WHERE a.id = ?
    `).get(id);
}

// GET /api/appointments/doctors
router.get('/doctors', (req, res) => {
    const doctors = db.prepare(`
        SELECT id, name, specialty
        FROM doctors
        WHERE is_active = 1
        ORDER BY name
    `).all();

    res.json({ success: true, data: doctors, count: doctors.length });
});

// GET /api/appointments/slots?date=YYYY-MM-DD&doctorId=1
router.get('/slots',
    query('date').optional().isISO8601({ strict: true })
        .withMessage('Date must use YYYY-MM-DD format'),
    query('doctorId').optional().isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    handleValidation,
    (req, res) => {
        const filters = [
            'd.is_active = 1',
            "s.appointment_date >= date('now', 'localtime')",
            "(s.appointment_date > date('now', 'localtime') OR s.start_time > time('now', 'localtime'))",
            `NOT EXISTS (
                SELECT 1 FROM appointments a
                WHERE a.slot_id = s.id
                  AND a.status IN ('REQUESTED', 'CONFIRMED')
            )`,
        ];
        const values = [];

        if (req.query.date) {
            filters.push('s.appointment_date = ?');
            values.push(req.query.date);
        }
        if (req.query.doctorId) {
            filters.push('d.id = ?');
            values.push(Number(req.query.doctorId));
        }

        const slots = db.prepare(`
            SELECT s.id, s.doctor_id, d.name AS doctor_name, d.specialty,
                   s.appointment_date, s.start_time, s.end_time
            FROM appointment_slots s
            JOIN doctors d ON d.id = s.doctor_id
            WHERE ${filters.join(' AND ')}
            ORDER BY s.appointment_date, s.start_time, d.name
        `).all(...values);

        res.json({ success: true, data: slots, count: slots.length });
    }
);

// GET /api/appointments/patient/:patientId
router.get('/patient/:patientId',
    param('patientId').isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    handleValidation,
    (req, res) => {
        const patientId = Number(req.params.patientId);
        const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const appointments = db.prepare(`
            SELECT a.id, a.patient_id, a.slot_id, a.status, a.reason,
                   a.requested_at, a.updated_at,
                   s.appointment_date, s.start_time, s.end_time,
                   d.name AS doctor_name, d.specialty
            FROM appointments a
            JOIN appointment_slots s ON s.id = a.slot_id
            JOIN doctors d ON d.id = s.doctor_id
            WHERE a.patient_id = ?
            ORDER BY s.appointment_date DESC, s.start_time DESC
        `).all(patientId);

        res.json({ success: true, data: appointments, count: appointments.length });
    }
);

// POST /api/appointments
router.post('/',
    body('patientId').isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    body('slotId').isInt({ min: 1 })
        .withMessage('Slot ID must be a positive integer'),
    body('reason').optional().isLength({ max: 500 })
        .withMessage('Reason must not exceed 500 characters'),
    handleValidation,
    (req, res) => {
        const patientId = Number(req.body.patientId);
        const slotId = Number(req.body.slotId);

        try {
            const outcome = db.transaction(() => {
                const patient = db.prepare('SELECT id FROM patients WHERE id = ?')
                    .get(patientId);
                if (!patient) {
                    return { status: 404, body: { success: false, message: 'Patient not found' } };
                }

                const slot = db.prepare(`
                    SELECT s.id, s.appointment_date, s.start_time
                    FROM appointment_slots s
                    JOIN doctors d ON d.id = s.doctor_id
                    WHERE s.id = ? AND d.is_active = 1
                `).get(slotId);
                if (!slot) {
                    return { status: 404, body: { success: false, message: 'Appointment slot not found' } };
                }

                const slotStart = new Date(
                    `${slot.appointment_date}T${slot.start_time}:00`
                );
                if (Number.isNaN(slotStart.getTime()) || slotStart <= new Date()) {
                    return { status: 400, body: { success: false, message: 'Appointment slot must be in the future' } };
                }

                const result = db.prepare(`
                    INSERT INTO appointments (patient_id, slot_id, reason)
                    VALUES (?, ?, ?)
                `).run(patientId, slotId, req.body.reason?.trim() || null);

                return { appointment: getAppointment(result.lastInsertRowid) };
            })();

            if (outcome.status) {
                return res.status(outcome.status).json(outcome.body);
            }
            return res.status(201).json({
                success: true,
                message: 'Appointment request submitted',
                data: outcome.appointment,
            });
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(409).json({
                    success: false,
                    message: 'This appointment slot is no longer available',
                });
            }
            return res.status(500).json({ success: false, message: 'Could not create appointment request' });
        }
    }
);

// GET /api/appointments/:id
router.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('Appointment ID must be a positive integer'),
    handleValidation,
    (req, res) => {
        const appointment = getAppointment(Number(req.params.id));
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.json({ success: true, data: appointment });
    }
);

// PATCH /api/appointments/:id/confirm
router.patch('/:id/confirm',
    param('id').isInt({ min: 1 }).withMessage('Appointment ID must be a positive integer'),
    handleValidation,
    (req, res) => updateStatus(req, res, 'CONFIRMED')
);

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel',
    param('id').isInt({ min: 1 }).withMessage('Appointment ID must be a positive integer'),
    handleValidation,
    (req, res) => updateStatus(req, res, 'CANCELLED')
);

function updateStatus(req, res, nextStatus) {
    const id = Number(req.params.id);
    const appointment = getAppointment(id);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === nextStatus) {
        return res.json({ success: true, data: appointment });
    }

    if (nextStatus === 'CONFIRMED' && appointment.status !== 'REQUESTED') {
        return res.status(409).json({
            success: false,
            message: 'Only a requested appointment can be confirmed',
        });
    }

    db.prepare(`
        UPDATE appointments
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
    `).run(nextStatus, id);

    res.json({ success: true, data: getAppointment(id) });
}

module.exports = router;
