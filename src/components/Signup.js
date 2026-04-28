import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiUserPlus,
  FiMapPin,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import "./Signup.css";

function formatCollegeOption(c) {
  if (!c?.name) return "";
  return `${c.name.trim()}${c.city ? ` — ${c.city.trim()}` : ""}`;
}

function formatCollegeOptionLabel(c) {
  if (!c?.name) return "";
  return c.city ? `${c.name} — ${c.city}` : c.name;
}

const ROLE_OPTIONS = [
  {
    value: "buyer",
    title: "Buyer",
    desc: "Browse, save listings, and chat to buy. You will not post items for sale.",
  },
  {
    value: "seller",
    title: "Seller",
    desc: "List items and manage chats. You can still browse the marketplace.",
  },
  {
    value: "both",
    title: "Both",
    desc: "Full access: buy and sell from one account (recommended).",
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    campusName: "",
    role: "both",
  });
  const [collegesMeta, setCollegesMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await productService.getCollegesMeta();
        if (!cancelled && data?.colleges?.length) setCollegesMeta(data);
      } catch {
        if (!cancelled) setCollegesMeta(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const applyCampusSuggestion = (label) => {
    setFormData((prev) => ({ ...prev, campusName: label }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setError("Password must include uppercase, lowercase, and a number");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.campusName.trim() || formData.campusName.trim().length < 2) {
      setError("Enter your institute or campus name (at least 2 characters)");
      return false;
    }
    if (!formData.role) {
      setError("Choose how you will use Campus Market");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
      formData.campusName.trim(),
      formData.role
    );

    if (result.success) {
      navigate("/login");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const datalistId = "campus-suggestions-list";

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-icon">
            <FiUserPlus />
          </div>
          <h1>Create Account</h1>
          <p>Join Campus Market and start trading</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@college.edu"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="campusName">Your campus / institute</label>
            <div className="input-wrapper">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                id="campusName"
                name="campusName"
                value={formData.campusName}
                onChange={handleChange}
                placeholder="Type any college or university name"
                list={collegesMeta?.colleges?.length ? datalistId : undefined}
                autoComplete="organization"
                maxLength={120}
                required
              />
            </div>
            {collegesMeta?.colleges?.length ? (
              <datalist id={datalistId}>
                {collegesMeta.colleges.map((c) => (
                  <option key={c.id} value={formatCollegeOptionLabel(c)} />
                ))}
              </datalist>
            ) : null}
            {collegesMeta?.colleges?.length ? (
              <div className="signup-campus-quick">
                <span className="signup-campus-quick-label">Quick pick (optional)</span>
                <div className="signup-campus-pills" role="list">
                  {collegesMeta.colleges.map((c) => {
                    const label = formatCollegeOptionLabel(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className="signup-campus-pill"
                        onClick={() => applyCampusSuggestion(label)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="signup-campus-quick-hint">
                  Tap one to fill the box, or type any other institute name above.
                </p>
              </div>
            ) : null}
          </div>

          <fieldset className="signup-fieldset">
            <legend className="signup-fieldset-legend">How will you use Campus Market?</legend>
            <div className="signup-role-grid">
              {ROLE_OPTIONS.map((opt) => {
                const active = formData.role === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`signup-role-card ${active ? "signup-role-card--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={active}
                      onChange={handleChange}
                    />
                    <span className="signup-role-title">
                      {opt.value === "buyer" ? (
                        <FiShoppingBag aria-hidden />
                      ) : (
                        <FiTag aria-hidden />
                      )}
                      {opt.title}
                    </span>
                    <span className="signup-role-desc">{opt.desc}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 chars, 1 uppercase, 1 number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="signup-submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
