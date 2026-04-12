import { io } from "socket.io-client";
import { SOCKET_URL } from "./api";

let socket;

export const getSocket = () => {
  const token = localStorage.getItem("token");
  if (socket) {
    if (socket.auth?.token !== token) {
      socket.disconnect();
      socket = null;
    } else {
      return socket;
    }
  }
  if (!token) return null;
  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: { token },
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
