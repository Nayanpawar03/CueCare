import axios from 'axios';

const BASE = '/api/appointments';

export const getDoctors = () => axios.get(`${BASE}/doctors`);

export const getAvailableSlots = (filters = {}) =>
    axios.get(`${BASE}/slots`, { params: filters });

export const getPatientAppointments = (patientId) =>
    axios.get(`${BASE}/patient/${patientId}`);

export const requestAppointment = (data) => axios.post(BASE, data);

export const confirmAppointment = (id) =>
    axios.patch(`${BASE}/${id}/confirm`);

export const cancelAppointment = (id) =>
    axios.patch(`${BASE}/${id}/cancel`);
