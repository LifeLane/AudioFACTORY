const fs = require('fs');
const content = fs.readFileSync('backend/middleware/auth.ts', 'utf8');
const patched = content.replace(
  "console.error('[AuthMiddleware] ID token verification failed:', err.message);",
  "console.error('[AuthMiddleware] ID token verification failed:', err.message, 'Token was:', token ? token.substring(0, 20) + '...' : String(token));"
);
fs.writeFileSync('backend/middleware/auth.ts', patched);
