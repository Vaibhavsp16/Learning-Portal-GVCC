import React from "react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <a href="/" className="logo-section" onClick={(e) => {
          e.preventDefault();
          // Simply refresh or let main page routing handle it
          window.location.hash = "";
        }}>
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span>Learning Portal</span>
        </a>

        {user && (
          <div className="user-profile-menu">
            <div className="student-badge">
              <div className="student-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username} (Student)</span>
            </div>
            
            <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out of Portal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
