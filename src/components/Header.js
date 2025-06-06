import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiList, FiPlus, FiUser } from "react-icons/fi";
import "./Header.css";

const Header = () => {
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
          <Link to="/add-product" className="nav-link">
            <FiPlus />
            Sell Item
          </Link>
        </nav>

        <div className="user-info">
          <FiUser />
          <span>Student Portal</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
