import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let io = null;

export const initSocketServer = (httpServer) => {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.endsWith('.vercel.app') ||
          origin.includes('dwarix')
        ) {
          return callback(null, true);
        }
        return callback(new Error(`Socket CORS disallowed: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    // Check if client is an authenticated admin via handshake cookie or auth token
    let isAdmin = false;
    const cookieHeader = socket.handshake.headers.cookie;
    let token = socket.handshake.auth?.token;

    if (!token && cookieHeader) {
      const match = cookieHeader.match(/dwarix_admin_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded && decoded.id) {
          isAdmin = true;
          socket.join('admin');
        }
      } catch (_) {
        // invalid token, stays public client
      }
    }

    // Every connected client joins the public room for real-time content updates
    socket.join('public');

    socket.on('disconnect', () => {
      // client disconnected cleanly
    });
  });

  return io;
};

export const getIO = () => io;

// Real-Time Event Dispatchers
export const emitCompanyUpdated = (companyData) => {
  if (!io) return;
  io.to('public').emit('company:updated', {
    timestamp: Date.now(),
    data: companyData
  });
};

export const emitProjectEvent = (eventType, projectData) => {
  if (!io) return;
  // eventType: 'project:created' | 'project:updated' | 'project:deleted'
  io.to('public').emit(eventType, {
    timestamp: Date.now(),
    data: projectData
  });
};

export const emitServiceEvent = (eventType, serviceData) => {
  if (!io) return;
  // eventType: 'service:created' | 'service:updated' | 'service:deleted'
  io.to('public').emit(eventType, {
    timestamp: Date.now(),
    data: serviceData
  });
};

export const emitTechnologyEvent = (eventType, techData) => {
  if (!io) return;
  // eventType: 'technology:created' | 'technology:updated' | 'technology:deleted'
  io.to('public').emit(eventType, {
    timestamp: Date.now(),
    data: techData
  });
};

// Admin-only event (never sent to public room)
export const emitAdminNewEnquiry = (enquiry) => {
  if (!io) return;
  io.to('admin').emit('enquiry:new', {
    timestamp: Date.now(),
    enquiry: {
      _id: enquiry._id,
      referenceId: enquiry.referenceId,
      name: enquiry.name,
      email: enquiry.email,
      service: enquiry.service,
      createdAt: enquiry.createdAt
    }
  });
};

