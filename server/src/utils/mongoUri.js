/**
 * MongoDB URI Utilities for DWARIX MERN Architecture
 * 
 * - Safely handles unencoded special characters (e.g. '@' in passwords) in Atlas URIs.
 * - Redacts credentials for logging and error reporting without exposing secrets.
 */

/**
 * Sanitizes a MongoDB connection URI by percent-encoding username and password components
 * if they contain unencoded reserved characters (such as '@' in passwords).
 * 
 * @param {string} uri - Raw MongoDB connection string
 * @returns {string} - Properly percent-encoded MongoDB connection URI
 */
export function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return uri;

  const trimmed = uri.trim();
  const protoMatch = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!protoMatch) return trimmed;

  const protocol = protoMatch[1];
  const rest = protoMatch[2];

  // Find host boundary: last '@' before path or query string
  const queryOrPathIdx = rest.search(/[/?]/);
  const authAndHost = queryOrPathIdx === -1 ? rest : rest.slice(0, queryOrPathIdx);
  const tail = queryOrPathIdx === -1 ? '' : rest.slice(queryOrPathIdx);

  const lastAt = authAndHost.lastIndexOf('@');
  if (lastAt === -1) {
    // No credentials in URI (e.g. mongodb://localhost:27017/db)
    return trimmed;
  }

  const authPart = authAndHost.slice(0, lastAt);
  const hostPart = authAndHost.slice(lastAt + 1);

  const firstColon = authPart.indexOf(':');
  if (firstColon === -1) {
    const rawUser = authPart;
    const user = encodeURIComponent(safeDecode(rawUser));
    return `${protocol}${user}@${hostPart}${tail}`;
  }

  const rawUser = authPart.slice(0, firstColon);
  const rawPass = authPart.slice(firstColon + 1);

  const user = encodeURIComponent(safeDecode(rawUser));
  const pass = encodeURIComponent(safeDecode(rawPass));

  return `${protocol}${user}:${pass}@${hostPart}${tail}`;
}

/**
 * Safely decodes a URI component without throwing on malformed sequences.
 * 
 * @param {string} str 
 * @returns {string}
 */
function safeDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Redacts credentials from a MongoDB connection URI for safe logging.
 * Replaces the password with '****' and masks the username if present.
 * 
 * @param {string} uri - Raw or encoded MongoDB connection string
 * @returns {string} - Redacted URI safe for logs and health checks
 */
export function redactMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '[not configured]';

  // Handle in-memory or keyword strings
  if (uri === 'memory') return 'in-memory://isolated';

  try {
    return uri.replace(
      /(mongodb(?:\+srv)?:\/\/)([^:@]+)(?::([^@]+))?@/i,
      (match, protocol, user, pass) => {
        const maskedUser = user ? `${user.slice(0, 3)}***` : '***';
        return `${protocol}${maskedUser}:****@`;
      }
    );
  } catch {
    return '[redacted mongo uri]';
  }
}

/**
 * Redacts a host string or cluster domain for safe display.
 * 
 * @param {string} host 
 * @returns {string}
 */
export function redactHost(host) {
  if (!host) return 'unknown';
  // If host contains credentials or sensitive parts, mask it
  return host.replace(/:[^@]+@/, ':****@');
}

export default {
  sanitizeMongoUri,
  redactMongoUri,
  redactHost
};

