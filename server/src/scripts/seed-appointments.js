const db = require('../db/database');

const demoDoctors = [
    { name: 'Dr. Demo One', specialty: 'General Medicine' },
    { name: 'Dr. Demo Two', specialty: 'Pediatrics' },
];

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
    const insertSlot = db.prepare(`
        INSERT OR IGNORE INTO appointment_slots
            (doctor_id, appointment_date, start_time, end_time)
        VALUES (?, ?, ?, ?)
    `);

    const doctors = demoDoctors.map((doctor) => {
        let savedDoctor = findDoctor.get(doctor.name);

        if (!savedDoctor) {
            const result = insertDoctor.run(doctor.name, doctor.specialty);
            savedDoctor = { id: result.lastInsertRowid };
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
        `Seed complete: ${result.doctorCount} demo doctors; ` +
        `${result.addedSlots} new appointment slots added.`
    );
} finally {
    db.close();
}
