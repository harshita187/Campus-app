import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiLogIn,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const loginBenefits = [
  "Campus marketplace ke liye fast access",
  "Verified student-to-student conversations",
  "Listings, chat, aur deals ek hi jagah",
];

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
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-kicker">Campus Market</span>
          <h1>Sign in and continue buying, selling, and chatting on campus.</h1>
          <p>
            Cleaner flow, easier discovery, aur direct student connections. Login
            ke baad aap seedha marketplace aur chats me jaa sakte ho.
          </p>

          <div className="auth-benefits">
            {loginBenefits.map((item) => (
              <div className="benefit-item" key={item}>
                <FiCheckCircle />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-showcase-card">
            <FiShield />
            <div>
              <strong>Local login tip</strong>
              <span>
                Agar aap localhost par ho, app ab default local backend ko use karegi.
              </span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon">
                <FiLogIn />
              </div>
              <h2>Welcome back</h2>
              <p>Use your registered email and password to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <div className="auth-input">
                  <FiMail className="auth-input-icon" />
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
                  <FiLock className="auth-input-icon" />
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
                {!loading && <FiArrowRight />}
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
