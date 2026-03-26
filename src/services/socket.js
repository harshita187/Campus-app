import { io } from "socket.io-client";
import { SOCKET_URL } from "./api";

let socket;

export const getSocket = () => {
  if (socket) return socket;
  const token = localStorage.getItem("token");
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
