import { Link } from 'react-router-dom';

const steps = [
    { number: '01', icon: 'bi-person-plus', title: 'Register a patient', description: 'Create a patient profile with the details needed for clinic visits.' },
    { number: '02', icon: 'bi-calendar2-week', title: 'Choose a time', description: 'Browse upcoming availability by date and doctor, then send a request.' },
    { number: '03', icon: 'bi-check2-circle', title: 'Track the request', description: 'See the appointment status and confirm or cancel the request when needed.' },
];

export default function Home() {
    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="container home-hero-content">
                    <div className="home-hero-copy">
                        <span className="hero-kicker">
                            <i className="bi bi-heart-pulse me-2"></i>CLINIC APPOINTMENTS, MADE CLEAR
                        </span>
                        <h1>Care that fits your schedule.</h1>
                        <p className="hero-description">
                            Find a suitable appointment time, send a request, and keep track of what happens next.
                        </p>
                        <div className="hero-actions">
                            <Link to="/appointments" className="btn btn-light btn-lg">
                                Find an appointment <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                            <Link to="/patients/new" className="btn btn-outline-light btn-lg">
                                Register a patient
                            </Link>
                        </div>
                        <div className="hero-note">
                            <i className="bi bi-shield-check me-2"></i>A simple way to manage clinic visits
                        </div>
                    </div>

                    <div className="hero-visual" aria-label="Three steps to manage an appointment">
                        <div className="hero-visual-topline">
                            <span className="hero-visual-icon"><i className="bi bi-calendar2-check"></i></span>
                            <span className="hero-visual-label">YOUR VISIT, STEP BY STEP</span>
                        </div>
                        <h2>From first request to confirmed visit.</h2>
                        <div className="hero-timeline">
                            {steps.map((step, index) => (
                                <div className="hero-timeline-row" key={step.number}>
                                    <div className="timeline-marker"><i className={`bi ${step.icon}`}></i></div>
                                    {index < steps.length - 1 && <span className="timeline-line"></span>}
                                    <div>
                                        <span className="timeline-step">STEP {step.number}</span>
                                        <strong>{step.title}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hero-visual-footer">
                            <i className="bi bi-info-circle me-2"></i>
                            Appointment requests show their current status in CueCare.
                        </div>
                    </div>
                </div>
            </section>

            <section className="container home-how-section">
                <div className="section-heading">
                    <span className="section-kicker">A SIMPLE FLOW</span>
                    <h2>Everything you need for the next visit</h2>
                    <p>Register, choose an available slot, and follow the appointment status from one place.</p>
                </div>
                <div className="row g-3 g-lg-4">
                    {steps.map((step) => (
                        <div className="col-md-4" key={step.number}>
                            <article className="how-step-card h-100">
                                <div className="how-step-icon"><i className={`bi ${step.icon}`}></i></div>
                                <span className="how-step-number">{step.number}</span>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </article>
                        </div>
                    ))}
                </div>
                <div className="home-bottom-cta">
                    <div>
                        <h2>Ready to find a time?</h2>
                        <p className="mb-0">Browse the clinic’s upcoming appointment slots.</p>
                    </div>
                    <Link to="/appointments" className="btn btn-primary">
                        View appointments <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                </div>
            </section>

            <footer className="home-footer">
                <div className="container d-flex flex-wrap justify-content-between gap-2">
                    <span><i className="bi bi-hospital me-2"></i>CueCare Clinic Scheduling</span>
                    <span>DevOps Academic Project · Nayan Pawar</span>
                </div>
            </footer>
        </main>
    );
}
