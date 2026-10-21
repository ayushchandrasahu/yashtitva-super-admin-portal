import React from 'react';

export default function Header({ user, onLogout, onNavigate, currentPath }) {
  return (
    <header className="brand-header">
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
        onClick={() => onNavigate('/super-admin')}
        title="Yashtitva Portal"
      >
        <img 
          src="/yashtitva-logo.png" 
          alt="Yashtitva Logo" 
          className="brand-corner-logo" 
        />
      </div>

      {user && (
        <div className="brand-header-actions">
          {currentPath !== '/super-admin' && (
            <button 
              className="nav-link-btn" 
              onClick={() => onNavigate('/super-admin')}
            >
              Super Admin Home
            </button>
          )}

          {currentPath !== '/super-admin/colleges' && (
            <button 
              className="nav-link-btn" 
              onClick={() => onNavigate('/super-admin/colleges')}
            >
              Registered Colleges
            </button>
          )}

          {currentPath !== '/super-admin/colleges/register' && (
            <button 
              className="nav-link-btn" 
              onClick={() => onNavigate('/super-admin/colleges/register')}
            >
              Register College
            </button>
          )}

          <span className="admin-badge">
            {user.userId} (Super Admin)
          </span>

          <button 
            className="nav-link-btn danger" 
            onClick={onLogout}
            title="End Session"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
