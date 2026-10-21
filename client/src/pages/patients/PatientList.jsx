import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../../api/patients';

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [flash, setFlash] = useState(
        sessionStorage.getItem('flash') || null
    );

    // Clear flash after showing it once
    useEffect(() => {
        if (flash) sessionStorage.removeItem('flash');
    }, [flash]);

    const fetchPatients = async (q = '') => {
        setLoading(true);
        try {
            const res = await getPatients(q);
            setPatients(res.data.data);
        } catch {
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPatients(search);
    };

    const handleReset = () => {
        setSearch('');
        fetchPatients('');
    };

    return (
        <div className="container mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-people me-2 text-primary"></i>Registered Patients
                    </h2>
                    <small className="text-muted">
                        Total: <strong>{patients.length}</strong> patient(s)
                    </small>
                </div>
                <Link to="/patients/new" className="btn btn-primary">
                    <i className="bi bi-person-plus me-1"></i>Register New Patient
                </Link>
            </div>

            {/* Flash message */}
            {flash && (
                <div className="alert alert-success alert-dismissible fade show">
                    <i className="bi bi-check-circle me-2"></i>{flash}
                    <button className="btn-close" onClick={() => setFlash(null)}></button>
                </div>
            )}

            {/* Search */}
            <div className="card shadow-sm mb-4 border-0">
                <div className="card-body py-3">
                    <form onSubmit={handleSearch} className="row g-2 align-items-center">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, email, or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100">Search</button>
                        </div>
                        <div className="col-md-2">
                            <button type="button" className="btn btn-outline-secondary w-100" onClick={handleReset}>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-person-x display-4 text-muted"></i>
                            <p className="mt-3 text-muted">
                                {search
                                    ? <>No patients found matching "<strong>{search}</strong>".</>
                                    : 'No patients registered yet.'}
                            </p>
                            <Link to="/patients/new" className="btn btn-primary mt-2">
                                <i className="bi bi-person-plus me-1"></i>Register First Patient
                            </Link>
                        </div>
                    ) : (
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Gender</th>
                                    <th>Date of Birth</th>
                                    <th>Registered On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((p, i) => (
                                    <tr key={p.id}>
                                        <td className="text-muted">{i + 1}</td>
                                        <td>
                                            <i className="bi bi-person-circle me-1 text-primary"></i>
                                            <strong>{p.first_name} {p.last_name}</strong>
                                        </td>
                                        <td>{p.email}</td>
                                        <td>{p.phone}</td>
                                        <td>
                                            <span className={`badge ${p.gender === 'Male' ? 'bg-info text-dark' :
                                                    p.gender === 'Female' ? 'bg-danger' : 'bg-secondary'
                                                }`}>
                                                {p.gender}
                                            </span>
                                        </td>
                                        <td>{new Date(p.date_of_birth).toLocaleDateString('en-IN')}</td>
                                        <td>{new Date(p.registered_at).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <Link
                                                to={`/patients/${p.id}/edit`}
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                <i className="bi bi-pencil"></i> Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
