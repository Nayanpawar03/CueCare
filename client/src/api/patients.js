import axios from 'axios';

const BASE = '/api/patients';

export const getPatients = (search = '') =>
    axios.get(BASE, { params: search ? { search } : {} });

export const getPatient = (id) => axios.get(`${BASE}/${id}`);
export const createPatient = (data) => axios.post(BASE, data);
export const updatePatient = (id, data) => axios.put(`${BASE}/${id}`, data);
