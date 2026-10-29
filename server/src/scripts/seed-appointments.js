const db = require('../db/database');

const clinicDoctors = [
    { name: 'Dr. Aanya Mehta', specialty: 'General Medicine' },
    { name: 'Dr. Arjun Rao', specialty: 'Pediatrics' },
    { name: 'Dr. Kavya Iyer', specialty: 'Cardiology' },
    { name: 'Dr. Rohan Shah', specialty: 'Dermatology' },
    { name: 'Dr. Neha Kapoor', specialty: 'Orthopedics' },
    { name: 'Dr. Sameer Patel', specialty: 'ENT' },
];

// Rename the original sample doctors in place so their existing slots and
// appointment history remain attached to the same doctor records.
const legacyDoctorNames = new Map([
    ['Dr. Aanya Mehta', 'Dr. Demo One'],
    ['Dr. Arjun Rao', 'Dr. Demo Two'],
]);

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(totalMinutes) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
}

const seed = db.transaction(() => {
    const insertDoctor = db.prepare(
        'INSERT INTO doctors (name, specialty) VALUES (?, ?)'
    );
    const findDoctor = db.prepare(
        'SELECT id FROM doctors WHERE name = ?'
    );
    const renameDoctor = db.prepare(
        'UPDATE doctors SET name = ?, specialty = ? WHERE id = ?'
    );
    const insertSlot = db.prepare(`
        INSERT OR IGNORE INTO appointment_slots
            (doctor_id, appointment_date, start_time, end_time)
        VALUES (?, ?, ?, ?)
    `);

    const doctors = clinicDoctors.map((doctor) => {
        let savedDoctor = findDoctor.get(doctor.name);

        if (!savedDoctor) {
            const legacyName = legacyDoctorNames.get(doctor.name);
            if (legacyName) savedDoctor = findDoctor.get(legacyName);
        }

        if (!savedDoctor) {
            const result = insertDoctor.run(doctor.name, doctor.specialty);
            savedDoctor = { id: result.lastInsertRowid };
        } else {
            renameDoctor.run(doctor.name, doctor.specialty, savedDoctor.id);
        }

        return savedDoctor;
    });

    let addedSlots = 0;

    // Seed the next 14 days, skipping Sundays. Each doctor has
    // six 30-minute slots between 09:00 and 12:00.
    for (let offset = 1; offset <= 14; offset += 1) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + offset);

        if (date.getDay() === 0) continue;

        for (const doctor of doctors) {
            for (let start = 9 * 60; start < 12 * 60; start += 30) {
                const result = insertSlot.run(
                    doctor.id,
                    formatDate(date),
                    formatTime(start),
                    formatTime(start + 30)
                );
                addedSlots += result.changes;
            }
        }
    }

    return { doctorCount: doctors.length, addedSlots };
});

try {
    const result = seed();
    console.log(
        `Seed complete: ${result.doctorCount} clinic doctors; ` +
        `${result.addedSlots} new appointment slots added.`
    );
} finally {
    db.close();
}
