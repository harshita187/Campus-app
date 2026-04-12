import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiLock,
  FiLogIn,
  FiMail,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email.trim(), formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-page-bg" aria-hidden>
        <div className="auth-page-mesh" />
        <div className="auth-page-orb auth-page-orb--a" />
        <div className="auth-page-orb auth-page-orb--b" />
        <div className="auth-page-orb auth-page-orb--c" />
        <div className="auth-page-dots" />
      </div>

      <div className="auth-page-inner">
        <section className="auth-card" aria-labelledby="login-heading">
          <div className="auth-card-brand">
            <span className="auth-card-logo">CM</span>
            <span className="auth-card-brand-name">Campus Market</span>
          </div>

          <div className="auth-header">
            <div className="auth-icon">
              <FiLogIn aria-hidden />
            </div>
            <h2 id="login-heading">Welcome back</h2>
            <p>Sign in with your campus email to browse listings and chat.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input">
                <FiMail className="auth-input-icon" aria-hidden />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@college.edu"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input">
                <FiLock className="auth-input-icon" aria-hidden />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <FiArrowRight aria-hidden />}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="auth-link">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
