import { Link } from 'react-router-dom';

export default function Home() {
    const features = [
        {
            icon: 'bi-person-plus',
            color: 'text-primary',
            title: 'Patient Registration',
            desc: 'Register new patients and manage patient profiles.',
            link: '/patients',
            linkLabel: 'Go to Patients',
            ready: true,
        },
        {
            icon: 'bi-calendar-check',
            color: 'text-success',
            title: 'Book Appointment',
            desc: 'View available slots and book appointments.',
            ready: false,
        },
        {
            icon: 'bi-clock-history',
            color: 'text-warning',
            title: 'Status Tracking',
            desc: 'Track and manage appointment status.',
            ready: false,
        },
    ];

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <i className="bi bi-hospital display-1 text-primary"></i>
                    <h1 className="mt-3 fw-bold">CueCare</h1>
                    <p className="lead text-muted">Clinic Appointment Scheduling System</p>
                    <p className="text-muted">
                        Manage clinic appointments efficiently. Register patients, view available
                        slots, book appointments, and track status — all in one place.
                    </p>
                </div>
            </div>

            <div className="row mt-5 g-4 justify-content-center">
                {features.map((f) => (
                    <div key={f.title} className="col-md-4">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body text-center p-4">
                                <i className={`bi ${f.icon} display-5 ${f.color} mb-3`}></i>
                                <h5 className="card-title">{f.title}</h5>
                                <p className="card-text text-muted">{f.desc}</p>
                                {f.ready ? (
                                    <Link to={f.link} className="btn btn-primary btn-sm">
                                        <i className="bi bi-arrow-right me-1"></i>{f.linkLabel}
                                    </Link>
                                ) : (
                                    <span className="badge bg-secondary">Coming Soon</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row mt-5">
                <div className="col text-center">
                    <small className="text-muted">
                        CueCare &mdash; DevOps Academic Project &mdash; Nayan Pawar (23102A0012)
                    </small>
                </div>
            </div>
        </div>
    );
}
