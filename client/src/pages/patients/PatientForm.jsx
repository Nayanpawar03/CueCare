import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPatient, createPatient, updatePatient } from '../../api/patients';

const EMPTY_FORM = {
    firstName: '', lastName: '', email: '',
    phone: '', dateOfBirth: '', gender: '', address: ''
};

export default function PatientForm() {
    const { id } = useParams();          // present on edit, absent on new
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load existing patient data when editing
    useEffect(() => {
        if (!isEdit) return;
        getPatient(id)
            .then(res => {
                const p = res.data.data;
                setForm({
                    firstName: p.first_name,
                    lastName: p.last_name,
                    email: p.email,
                    phone: p.phone,
                    dateOfBirth: p.date_of_birth,
                    gender: p.gender,
                    address: p.address || ''
                });
            })
            .catch(() => setApiError('Could not load patient data.'));
    }, [id, isEdit]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear field error on change
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    // Map server validation errors array → { field: message } object
    const mapErrors = (errArray) =>
        errArray.reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');
        setErrors({});

        try {
            if (isEdit) {
                await updatePatient(id, form);
            } else {
                await createPatient(form);
            }
            sessionStorage.setItem(
                'flash',
                `Patient ${form.firstName} ${form.lastName} ${isEdit ? 'updated' : 'registered'} successfully!`
            );
            navigate('/patients');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(mapErrors(data.errors));
            } else if (data?.message) {
                setApiError(data.message);
            } else {
                setApiError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const pageTitle = isEdit ? 'Edit Patient' : 'Register New Patient';

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">

                    {/* Breadcrumb */}
                    <nav className="mb-3">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/patients">
                                    <i className="bi bi-people me-1"></i>Patients
                                </Link>
                            </li>
                            <li className="breadcrumb-item active">{pageTitle}</li>
                        </ol>
                    </nav>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-person-plus me-2"></i>{pageTitle}
                            </h5>
                        </div>
                        <div className="card-body p-4">

                            {/* API-level error */}
                            {apiError && (
                                <div className="alert alert-danger">
                                    <i className="bi bi-exclamation-triangle me-2"></i>{apiError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="row g-3">

                                    {/* First Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text" name="firstName"
                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                            placeholder="e.g. Nayan"
                                            value={form.firstName} onChange={handleChange}
                                        />
                                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                                    </div>

                                    {/* Last Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text" name="lastName"
                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                            placeholder="e.g. Pawar"
                                            value={form.lastName} onChange={handleChange}
                                        />
                                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email" name="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="e.g. nayan@example.com"
                                            value={form.email} onChange={handleChange}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>

                                    {/* Phone */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Phone Number <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="tel" name="phone"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            placeholder="e.g. 9876543210"
                                            value={form.phone} onChange={handleChange}
                                        />
                                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                        <div className="form-text">10-digit Indian mobile number.</div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Date of Birth <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date" name="dateOfBirth"
                                            className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                            value={form.dateOfBirth} onChange={handleChange}
                                        />
                                        {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
                                    </div>

                                    {/* Gender */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Gender <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            name="gender"
                                            className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                                            value={form.gender} onChange={handleChange}
                                        >
                                            <option value="">— Select Gender —</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                        {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                                    </div>

                                    {/* Address */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Address</label>
                                        <textarea
                                            name="address" rows="3"
                                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                            placeholder="Street, City, State — optional"
                                            value={form.address} onChange={handleChange}
                                        />
                                        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                    </div>

                                </div>

                                <p className="text-muted mt-3 mb-4">
                                    <span className="text-danger">*</span> Required fields
                                </p>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading
                                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                            : <><i className="bi bi-check-circle me-1"></i>{isEdit ? 'Update Patient' : 'Register Patient'}</>
                                        }
                                    </button>
                                    <Link to="/patients" className="btn btn-outline-secondary">
                                        <i className="bi bi-arrow-left me-1"></i>Back
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
