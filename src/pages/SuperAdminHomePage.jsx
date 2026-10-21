import React from 'react';

export default function SuperAdminHomePage({ onNavigate }) {
  return (
    <main className="page-container" id="main-content">
      <div className="home-sections-grid">
        {/* Section A: New College Registration */}
        <section className="home-section-card" aria-labelledby="section-a-title">
          <div className="home-section-content">
            <h2 id="section-a-title" className="home-section-title">
              New College Registration
            </h2>
            <p className="home-section-desc">
              Ensure that only authorized representatives register colleges using genuine government approval documents. Verify the authenticity and legal validity of each submission before issuing a software licence. Remain vigilant against fraudulent registrations.
            </p>
          </div>
          <div className="home-section-action">
            <button
              id="btn-nav-register-college"
              className="btn-primary"
              onClick={() => onNavigate('/super-admin/colleges/register')}
            >
              Register New College
            </button>
          </div>
        </section>

        {/* Section B: Registered Colleges */}
        <section className="home-section-card" aria-labelledby="section-b-title">
          <div className="home-section-content">
            <h2 id="section-b-title" className="home-section-title">
              Registered Colleges
            </h2>
            <p className="home-section-desc">
              View colleges registered with Yashtitva and manage their authorized access to the SaaS platform.
            </p>
          </div>
          <div className="home-section-action">
            <button
              id="btn-nav-view-colleges"
              className="btn-primary"
              onClick={() => onNavigate('/super-admin/colleges')}
            >
              View Registered Colleges
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
