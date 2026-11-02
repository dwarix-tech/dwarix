import http from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocketServer } from './sockets/socketManager.js';

const startServer = async () => {
  try {
    console.log(`[DWARIX MERN Server] Initializing server in [${env.NODE_ENV}] mode...`);
    if (env.LOADED_ENV_PATH) {
      console.log(`[DWARIX MERN Server] Environment variables loaded from: ${env.LOADED_ENV_PATH}`);
    }

    // Connect to database (terminates with exit 1 if connection fails)
    await connectDB();

    const httpServer = http.createServer(app);

    // Initialize real-time Socket.IO engine
    initSocketServer(httpServer);

    const server = httpServer.listen(env.PORT, () => {
      console.log(`[DWARIX MERN Server] Running on http://localhost:${env.PORT} in [${env.NODE_ENV}] mode (Socket.IO active)`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[DWARIX MERN Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[DWARIX MERN Server] HTTP server closed.');
        try {
          await disconnectDB();
        } catch (err) {
          console.error('[DWARIX MERN Server] Error during database disconnect:', err.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('\n❌ [DWARIX MERN Server Startup Failed]');
    console.error(`Reason: ${error.message}\n`);
    process.exit(1);
  }
};

startServer();
