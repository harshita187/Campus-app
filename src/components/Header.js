import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPlus,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiMessageCircle,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const navClassName = ({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`;

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">CM</span>
          <span>Campus Market</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" className={navClassName} onClick={closeMenu}>
            <FiHome />
            Home
          </NavLink>
          <NavLink to="/products" className={navClassName} onClick={closeMenu}>
            <FiList />
            Products
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/add-product"
              className={navClassName}
              onClick={closeMenu}
            >
              <FiPlus />
              Sell Item
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/chat" className={navClassName} onClick={closeMenu}>
              <FiMessageCircle />
              Chats
            </NavLink>
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
              <Link to="/login" className="btn-auth btn-login" onClick={closeMenu}>
                <FiLogIn />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn-auth btn-signup" onClick={closeMenu}>
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
