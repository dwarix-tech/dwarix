import mongoose from 'mongoose';
import { env } from './env.js';
import { sanitizeMongoUri, redactMongoUri, redactHost } from '../utils/mongoUri.js';

let inMemoryServer = null;

/**
 * Returns detailed health and status information about the database connection
 */
export function getConnectionStatus() {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const state = mongoose.connection.readyState;
  const isConnected = state === 1;
  const host = mongoose.connection.host || null;
  const name = mongoose.connection.name || null;
  const isAtlas = Boolean(host && (host.includes('mongodb.net') || host.includes('azure') || host.includes('aws')));
  const isInMemory = Boolean(inMemoryServer);

  return {
    connected: isConnected,
    state: readyStateMap[state] || 'unknown',
    readyState: state,
    databaseType: isInMemory ? 'in-memory' : (isAtlas ? 'atlas' : 'local'),
    host: host ? redactHost(host) : null,
    name: name,
    configuredTarget: redactMongoUri(env.MONGODB_URI)
  };
}

/**
 * Establishes Mongoose connection to configured MongoDB URI.
 * Strictly avoids silent in-memory fallback unless explicitly opted in.
 */
export async function connectDB(targetUri) {
  // If targetUri is passed, use it; otherwise use env.MONGODB_URI
  const rawUri = targetUri !== undefined ? targetUri : env.MONGODB_URI;

  // 1. Explicit opt-in in-memory database check
  if (rawUri === 'memory' || (env.USE_IN_MEMORY_DB && !rawUri)) {
    if (env.isProduction) {
      const prodErr = new Error('[Database Error] In-memory database mode is strictly prohibited in production.');
      console.error(prodErr.message);
      throw prodErr;
    }

    if (!env.ALLOW_IN_MEMORY_DB && !env.USE_IN_MEMORY_DB && rawUri !== 'memory') {
      const disabledErr = new Error('[Database Error] In-memory database requested but ALLOW_IN_MEMORY_DB is not enabled.');
      console.error(disabledErr.message);
      throw disabledErr;
    }

    console.log('[MongoDB] Opt-in in-memory database mode enabled.');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    inMemoryServer = await MongoMemoryServer.create();
    const memUri = inMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[MongoDB] In-memory database initialized: ${memUri}`);
    return conn;
  }

  // 2. Validate URI presence
  if (!rawUri || rawUri.trim() === '') {
    const missingUriError = new Error(
      `[Database Configuration Error] MONGODB_URI is not defined. Please set MONGODB_URI in server/.env or environment variables.`
    );
    console.error(missingUriError.message);
    throw missingUriError;
  }

  // 3. Sanitize and redact for safe connection & logging
  const safeUri = sanitizeMongoUri(rawUri);
  const redactedUri = redactMongoUri(safeUri);

  console.log(`[MongoDB] Connecting to database: ${redactedUri}`);

  try {
    const conn = await mongoose.connect(safeUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`[MongoDB] ✓ Successfully connected to ${isAtlas ? 'MongoDB Atlas' : 'MongoDB'}: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Log clear connection diagnostics WITHOUT exposing credentials
    console.error(`\n[MongoDB Connection Failed]`);
    console.error(`- Target: ${redactedUri}`);

    if (error.message.includes('authentication failed') || error.code === 8000) {
      console.error(`- Cause: Authentication failed (bad auth).`);
      console.error(`- Action: Verify username and password in MONGODB_URI. If password contains special characters like '@', ensure it is percent-encoded (e.g. %40).`);
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error(`- Cause: Server selection timed out. Cluster unreachable or IP access list restricting connection.`);
      console.error(`- Action: Check network connectivity, DNS resolution, and MongoDB Atlas Network Access whitelist (IP Access List).`);
    } else {
      console.error(`- Cause: ${error.message}`);
    }

    // STRICT: Do not silently switch to in-memory fallback!
    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Connection closed.');
  }
  if (inMemoryServer) {
    await inMemoryServer.stop();
    inMemoryServer = null;
    console.log('[MongoDB] In-memory instance stopped.');
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime connection error: ${err.message}`);
});
