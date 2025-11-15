import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiList, FiPlus, FiUser, FiLogIn, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">🎓</span>
          Campus Market
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">
            <FiHome />
            Home
          </Link>
          <Link to="/products" className="nav-link">
            <FiList />
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/add-product" className="nav-link">
              <FiPlus />
              Sell Item
            </Link>
          )}
        </nav>

        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <FiUser />
                <span>{user?.name || "User"}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-auth btn-login">
                <FiLogIn />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn-auth btn-signup">
                <FiUser />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
