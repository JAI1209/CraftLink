import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

socket.on("connect", () => {
  console.info("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
});

export default socket;