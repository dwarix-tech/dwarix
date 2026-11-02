import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  const socketUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : window.location.origin;

  socket = io(socketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
  });

  socket.on('connect', () => {
    // console.log('[Socket.IO] Connected to real-time server:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    // console.log('[Socket.IO] Disconnected:', reason);
  });

  return socket;
};

export const subscribeToEvent = (event, callback) => {
  const s = getSocket();
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
};

