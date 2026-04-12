import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getSocket, disconnectSocket } from "../services/socket";

const ChatNotificationContext = createContext(null);

export const useChatNotifications = () => useContext(ChatNotificationContext);

export const ChatNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    if (location.pathname.startsWith("/chat")) {
      clearUnread();
    }
  }, [location.pathname, clearUnread]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectSocket();
      return undefined;
    }

    const socket = getSocket();
    if (!socket) return undefined;

    const onActivity = (payload) => {
      const sid = payload?.senderId;
      if (sid != null && String(sid) === String(user.id)) return;
      if (location.pathname.startsWith("/chat")) return;
      setUnreadCount((n) => n + 1);
    };

    socket.on("chat:activity", onActivity);
    return () => {
      socket.off("chat:activity", onActivity);
    };
  }, [isAuthenticated, user?.id, location.pathname]);

  const value = useMemo(
    () => ({
      unreadCount,
      clearUnread,
    }),
    [unreadCount, clearUnread]
  );

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
    </ChatNotificationContext.Provider>
  );
};
