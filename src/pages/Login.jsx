import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const { login, register } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (isRegistering && !username)) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      // Successful login/register will trigger context update and redirect
    } catch (err) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: "0 auto 16px auto", width: "48px", height: "48px", fontSize: "1.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h1>{isRegistering ? "Create Account" : "Student Login"}</h1>
          <p>{isRegistering ? "Register to access secure learning streams" : "Welcome back! Enter your portal credentials"}</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input
              id="email"
              type="text"
              className="form-control"
              placeholder="Username or email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} disabled={loading}>
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                {/* Loader animation */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }} className="spinner">
                  <path d="M21 12a9 9 0 01-9 9m-9-9a9 9 0 019-9" strokeLinecap="round"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isRegistering ? "Sign Up" : "Sign In"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {isRegistering ? "Already have an account? " : "New to the portal? "}
          <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }} className="auth-toggle-link">
            {isRegistering ? "Login Here" : "Create Account"}
          </a>
        </div>
      </div>
      
      {/* Simple style override for inline spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
