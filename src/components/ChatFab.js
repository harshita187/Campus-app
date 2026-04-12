import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import "./ChatFab.css";

const ChatFab = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/login" || path === "/signup") return null;
  if (path.startsWith("/chat")) return null;

  return (
    <Link to="/chat" className="chat-fab" aria-label="Open messages">
      <FiMessageCircle className="chat-fab-icon" aria-hidden />
    </Link>
  );
};

export default ChatFab;
