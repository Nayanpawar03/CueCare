import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../../api/patients';
import {
    cancelAppointment,
    confirmAppointment,
    getAvailableSlots,
    getDoctors,
    getPatientAppointments,
    requestAppointment,
} from '../../api/appointments';

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function tomorrowDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatLocalDate(date);
}

function displayDate(value) {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN');
}

function errorMessage(error) {
    return error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'The request could not be completed. Please try again.';
}

function statusBadge(status) {
    if (status === 'CONFIRMED') return 'bg-success';
    if (status === 'CANCELLED') return 'bg-secondary';
    return 'bg-warning text-dark';
}

const appointmentStatusLabels = Object.freeze({
    REQUESTED: 'REQUESTED',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
});

function displayAppointmentStatus(status) {
    return appointmentStatusLabels[status] || status;
}

export default function AppointmentPage() {
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState(tomorrowDate);
    const [doctorId, setDoctorId] = useState('');
    const [patientId, setPatientId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingSlotId, setSavingSlotId] = useState(null);
    const [busyAppointmentId, setBusyAppointmentId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        async function loadPageData() {
            setLoading(true);
            setError('');
            try {
                const [doctorResponse, patientResponse, slotResponse] = await Promise.all([
                    getDoctors(),
                    getPatients(),
                    getAvailableSlots({ date }),
                ]);
                if (!active) return;

                setDoctors(doctorResponse.data.data);
                const patientList = patientResponse.data.data;
                setPatients(patientList);
                if (patientList.length > 0) setPatientId(String(patientList[0].id));
                setSlots(slotResponse.data.data);
            } catch (loadError) {
                if (active) setError(errorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        }

        loadPageData();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadAppointments() {
            if (!patientId) {
                setAppointments([]);
                return;
            }
            try {
                const response = await getPatientAppointments(patientId);
                if (active) setAppointments(response.data.data);
            } catch (loadError) {
                if (active) setError(errorMessage(loadError));
            }
        }

        loadAppointments();
        return () => { active = false; };
    }, [patientId]);

    async function refreshSlots() {
        setError('');
        setLoading(true);
        try {
            const filters = { date };
            if (doctorId) filters.doctorId = doctorId;
            const response = await getAvailableSlots(filters);
            setSlots(response.data.data);
        } catch (loadError) {
            setError(errorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }

    async function refreshAppointments() {
        if (!patientId) return;
        try {
            const response = await getPatientAppointments(patientId);
            setAppointments(response.data.data);
        } catch (loadError) {
            setError(errorMessage(loadError));
        }
    }

    async function handleBooking(slot) {
        setError('');
        setMessage('');
        setSavingSlotId(slot.id);
        try {
            const response = await requestAppointment({
                patientId: Number(patientId),
                slotId: slot.id,
                reason,
            });
            setMessage(
                `Request #${response.data.data.id} submitted. Current status: REQUESTED.`
            );
            setReason('');
            await Promise.all([refreshSlots(), refreshAppointments()]);
        } catch (bookingError) {
            setError(errorMessage(bookingError));
        } finally {
            setSavingSlotId(null);
        }
    }

    async function handleStatusChange(appointmentId, action) {
        setError('');
        setMessage('');
        setBusyAppointmentId(appointmentId);
        try {
            if (action === 'confirm') await confirmAppointment(appointmentId);
            else await cancelAppointment(appointmentId);
            setMessage(`Appointment #${appointmentId} ${action === 'confirm' ? 'confirmed' : 'cancelled'}.`);
            await Promise.all([refreshSlots(), refreshAppointments()]);
        } catch (statusError) {
            setError(errorMessage(statusError));
        } finally {
            setBusyAppointmentId(null);
        }
    }

    return (
        <main className="container appointment-page py-4 py-lg-5">
            <div className="appointment-page-heading d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="section-kicker">SCHEDULE A VISIT</span>
                    <h1 className="mb-1 mt-1">
                        <i className="bi bi-calendar-check me-2 text-primary"></i>
                        Appointments
                    </h1>
                    <p className="text-muted mb-0">Find an available slot and track appointment requests.</p>
                </div>
                <Link to="/patients/new" className="btn btn-outline-primary">
                    <i className="bi bi-person-plus me-1"></i>Register Patient
                </Link>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {message && <div className="alert alert-success" role="status">{message}</div>}

            {patients.length === 0 && !loading ? (
                <div className="alert alert-info">
                    Register a patient before requesting an appointment.{' '}
                    <Link to="/patients/new">Register a patient</Link>.
                </div>
            ) : (
                <div className="row g-4 align-items-start">
                    <div className="col-lg-7">
                        <div className="card appointment-card">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0">Available appointment slots</h5>
                            </div>
                            <div className="card-body">
                                <form
                                    className="row g-3 align-items-end mb-4"
                                    onSubmit={(event) => { event.preventDefault(); refreshSlots(); }}
                                >
                                    <div className="col-md-5">
                                        <label className="form-label" htmlFor="appointment-date">Date</label>
                                        <input
                                            id="appointment-date"
                                            className="form-control"
                                            type="date"
                                            min={tomorrowDate()}
                                            value={date}
                                            onChange={(event) => setDate(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label" htmlFor="doctor-filter">Doctor</label>
                                        <select
                                            id="doctor-filter"
                                            className="form-select"
                                            value={doctorId}
                                            onChange={(event) => setDoctorId(event.target.value)}
                                        >
                                            <option value="">All doctors</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor.id} value={doctor.id}>
                                                    {doctor.name} — {doctor.specialty}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2 d-grid">
                                        <button className="btn btn-primary" type="submit" disabled={loading}>
                                            Search
                                        </button>
                                    </div>
                                </form>

                                {patients.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="booking-patient">Book for</label>
                                        <select
                                            id="booking-patient"
                                            className="form-select"
                                            value={patientId}
                                            onChange={(event) => setPatientId(event.target.value)}
                                            required
                                        >
                                            {patients.map((patient) => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.first_name} {patient.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="appointment-reason">Reason (optional)</label>
                                    <input
                                        id="appointment-reason"
                                        className="form-control"
                                        maxLength="500"
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        placeholder="Brief reason for the visit"
                                    />
                                </div>

                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : slots.length === 0 ? (
                                    <p className="text-muted text-center py-4 mb-0">
                                        No available slots for this date. Try another date or doctor.
                                    </p>
                                ) : (
                                    <div className="list-group available-slot-list">
                                        {slots.map((slot) => (
                                            <div key={slot.id} className="list-group-item">
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                                    <div className="slot-information">
                                                        <span className="slot-icon"><i className="bi bi-person-badge"></i></span>
                                                        <div>
                                                            <strong>{slot.doctor_name}</strong>
                                                            <div className="small text-muted">{slot.specialty}</div>
                                                            <div className="small">
                                                                {displayDate(slot.appointment_date)} · {slot.start_time}–{slot.end_time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        type="button"
                                                        disabled={!patientId || savingSlotId === slot.id}
                                                        onClick={() => handleBooking(slot)}
                                                    >
                                                        {savingSlotId === slot.id ? 'Requesting…' : 'Request appointment'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card appointment-card status-card">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0">Appointment status</h5>
                            </div>
                            <div className="card-body">
                                {appointments.length === 0 ? (
                                    <p className="text-muted mb-0">
                                        {patientId ? 'No appointments for this patient yet.' : 'Select a patient to view appointments.'}
                                    </p>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {appointments.map((appointment) => (
                                            <div key={appointment.id} className="list-group-item appointment-status-item px-0">
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <div>
                                                        <strong>Appointment #{appointment.id}</strong>
                                                        <div>{appointment.doctor_name}</div>
                                                        <div className="small text-muted">
                                                            {displayDate(appointment.appointment_date)} · {appointment.start_time}
                                                        </div>
                                                    </div>
                                                    <span className={`badge ${statusBadge(appointment.status)}`}>
                                                        {displayAppointmentStatus(appointment.status)}
                                                    </span>
                                                </div>
                                                {(appointment.status === 'REQUESTED' || appointment.status === 'CONFIRMED') && (
                                                    <div className="d-flex gap-2 mt-2">
                                                        {appointment.status === 'REQUESTED' && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                type="button"
                                                                disabled={busyAppointmentId === appointment.id}
                                                                onClick={() => handleStatusChange(appointment.id, 'confirm')}
                                                            >
                                                                Confirm
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            type="button"
                                                            disabled={busyAppointmentId === appointment.id}
                                                            onClick={() => handleStatusChange(appointment.id, 'cancel')}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
