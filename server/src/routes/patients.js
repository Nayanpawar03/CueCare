const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const db = require('../db/database');

const router = express.Router();

// ── Validation helpers ────────────────────────────────────────────────────────

const patientValidationRules = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email address is required')
        .isEmail().withMessage('Enter a valid email address')
        .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),

    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isDate().withMessage('Enter a valid date')
        .custom(val => {
            if (new Date(val) >= new Date()) throw new Error('Date of birth must be in the past');
            return true;
        }),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender value'),

    body('address')
        .optional()
        .isLength({ max: 255 }).withMessage('Address must not exceed 255 characters'),
];

function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// ── GET /api/patients ─────────────────────────────────────────────────────────
// Returns all patients; supports ?search= query param
router.get('/', (req, res) => {
    try {
        const { search } = req.query;
        let patients;

        if (search && search.trim()) {
            const q = `%${search.trim().toLowerCase()}%`;
            patients = db.prepare(`
        SELECT * FROM patients
        WHERE LOWER(first_name) LIKE ?
           OR LOWER(last_name)  LIKE ?
           OR LOWER(email)      LIKE ?
           OR phone              LIKE ?
        ORDER BY registered_at DESC
      `).all(q, q, q, q);
        } else {
            patients = db.prepare(
                'SELECT * FROM patients ORDER BY registered_at DESC'
            ).all();
        }

        res.json({ success: true, data: patients, count: patients.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/patients/:id ─────────────────────────────────────────────────────
router.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('Invalid patient ID'),
    handleValidation,
    (req, res) => {
        try {
            const patient = db.prepare('SELECT * FROM patients WHERE id = ?')
                .get(req.params.id);
            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }
            res.json({ success: true, data: patient });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// ── POST /api/patients ────────────────────────────────────────────────────────
router.post('/', patientValidationRules, handleValidation, (req, res) => {
    try {
        const { firstName, lastName, email, phone, dateOfBirth, gender, address } = req.body;

        // Duplicate email check
        const exists = db.prepare('SELECT id FROM patients WHERE email = ?').get(email);
        if (exists) {
            return res.status(409).json({
                success: false,
                message: `A patient with email '${email}' is already registered.`
            });
        }

        const result = db.prepare(`
      INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(firstName, lastName, email, phone, dateOfBirth, gender, address || null);

        const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?')
            .get(result.lastInsertRowid);

        res.status(201).json({ success: true, data: newPatient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/patients/:id ─────────────────────────────────────────────────────
router.put('/:id',
    param('id').isInt({ min: 1 }).withMessage('Invalid patient ID'),
    ...patientValidationRules,
    handleValidation,
    (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, phone, dateOfBirth, gender, address } = req.body;

            const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            // Duplicate email check (excluding current patient)
            const emailConflict = db.prepare(
                'SELECT id FROM patients WHERE email = ? AND id != ?'
            ).get(email, id);
            if (emailConflict) {
                return res.status(409).json({
                    success: false,
                    message: `Email '${email}' is already used by another patient.`
                });
            }

            db.prepare(`
        UPDATE patients
        SET first_name = ?, last_name = ?, email = ?, phone = ?,
            date_of_birth = ?, gender = ?, address = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(firstName, lastName, email, phone, dateOfBirth, gender, address || null, id);

            const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
            res.json({ success: true, data: updated });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

module.exports = router;
