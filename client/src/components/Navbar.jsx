import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { pathname } = useLocation();

    const isActive = (path) =>
        pathname === path || pathname.startsWith(path + '/') ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar navbar-expand-lg navbar-light app-navbar">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-hospital me-2"></i>CueCare
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className={pathname === '/' ? 'nav-link active' : 'nav-link'} to="/">
                                <i className="bi bi-house me-1"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive('/patients')} to="/patients">
                                <i className="bi bi-people me-1"></i>Patients
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={isActive('/appointments')} to="/appointments">
                                <i className="bi bi-calendar-check me-1"></i>Appointments
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
