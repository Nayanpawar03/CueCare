import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import AppointmentPage from './pages/appointments/AppointmentPage';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/new" element={<PatientForm />} />
                <Route path="/patients/:id/edit" element={<PatientForm />} />
                <Route path="/appointments" element={<AppointmentPage />} />
            </Routes>
        </BrowserRouter>
    );
}
