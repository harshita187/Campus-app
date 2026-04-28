import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiHeart,
  FiHome,
  FiLayout,
  FiList,
  FiPlus,
  FiLogIn,
  FiLogOut,
  FiMessageCircle,
  FiMenu,
  FiShield,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { canSell } from "../utils/roleHelpers";
import { getWishlistIds } from "../utils/wishlist";
import { useChatNotifications } from "../context/ChatNotificationContext";
import { isCampusEmail } from "../utils/campusEmail";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const chatNotif = useChatNotifications();
  const unreadCount = chatNotif?.unreadCount ?? 0;
  const [wishlistCount, setWishlistCount] = useState(() => getWishlistIds().length);

  useEffect(() => {
    const syncWish = () => setWishlistCount(getWishlistIds().length);
    syncWish();
    window.addEventListener("campus:wishlist-changed", syncWish);
    window.addEventListener("storage", syncWish);
    return () => {
      window.removeEventListener("campus:wishlist-changed", syncWish);
      window.removeEventListener("storage", syncWish);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const navClassName = ({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`;

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon" aria-hidden>
            CM
          </span>
          <span className="logo-text">
            <span className="logo-title">Campus Market</span>
            <span className="logo-tagline">Student marketplace</span>
          </span>
        </Link>

        <nav
          id="main-nav"
          className={`nav ${menuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" className={navClassName} onClick={closeMenu}>
            <FiHome />
            Home
          </NavLink>
          <NavLink to="/products" className={navClassName} onClick={closeMenu}>
            <FiList />
            Products
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/dashboard" className={navClassName} onClick={closeMenu}>
              <FiLayout />
              Dashboard
            </NavLink>
          ) : null}
          {isAuthenticated && (
            <NavLink to="/wishlist" className={navClassName} onClick={closeMenu}>
              <span className="nav-link-with-badge">
                <FiHeart />
                Saved
                {wishlistCount > 0 ? (
                  <span className="nav-chat-badge" aria-label={`${wishlistCount} saved listings`}>
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          )}
          {isAuthenticated && canSell(user?.role) ? (
            <NavLink
              to="/add-product"
              className={({ isActive }) =>
                `nav-link nav-link-sell ${isActive ? "nav-link-active" : ""}`
              }
              onClick={closeMenu}
            >
              <FiPlus />
              Sell Item
            </NavLink>
          ) : null}
          {isAuthenticated && (
            <NavLink to="/chat" className={navClassName} onClick={closeMenu}>
              <span className="nav-link-with-badge">
                <FiMessageCircle />
                Chats
                {unreadCount > 0 ? (
                  <span className="nav-chat-badge" aria-label={`${unreadCount} new messages`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          )}
        </nav>

        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-dropdown" ref={userMenuRef}>
              <button
                type="button"
                className="user-dropdown-trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="user-avatar" aria-hidden>
                  {(user?.name || "U").trim().charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{user?.name || "User"}</span>
                <FiChevronDown
                  className={`user-chevron ${userMenuOpen ? "user-chevron--open" : ""}`}
                  aria-hidden
                />
              </button>
              {userMenuOpen ? (
                <div className="user-dropdown-menu" role="menu">
                  <div className="user-dropdown-meta">
                    <span className="user-dropdown-email">{user?.email}</span>
                    {isCampusEmail(user?.email) ? (
                      <span className="verified-pill">
                        <FiShield aria-hidden />
                        Verified student
                      </span>
                    ) : null}
                  </div>
                  {canSell(user?.role) ? (
                    <Link
                      role="menuitem"
                      to="/products?mine=1"
                      className="user-dropdown-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        closeMenu();
                      }}
                    >
                      My listings
                    </Link>
                  ) : null}
                  <Link
                    role="menuitem"
                    to="/wishlist"
                    className="user-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      closeMenu();
                    }}
                  >
                    Wishlist (saved)
                  </Link>
                  {canSell(user?.role) ? (
                    <Link
                      role="menuitem"
                      to="/add-product"
                      className="user-dropdown-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        closeMenu();
                      }}
                    >
                      Post an item
                    </Link>
                  ) : null}
                  <Link
                    role="menuitem"
                    to="/chat"
                    className="user-dropdown-item user-dropdown-item--with-badge"
                    onClick={() => {
                      setUserMenuOpen(false);
                      closeMenu();
                    }}
                  >
                    <span>Messages</span>
                    {unreadCount > 0 ? (
                      <span className="dropdown-msg-badge" aria-label={`${unreadCount} new`}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="user-dropdown-item user-dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <FiLogOut aria-hidden />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-auth btn-login" onClick={closeMenu}>
                <FiLogIn aria-hidden />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn-auth btn-signup" onClick={closeMenu}>
                <span className="btn-signup-text">Sign up</span>
              </Link>
            </div>
          )}
        </div>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {menuOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}
    </header>
  );
};

export default Header;
