import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  return window.location.origin;
};

const socket = io(getSocketUrl(), { withCredentials: true });

export default socket;
