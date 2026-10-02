// Minimal static server for the built SPA on Azure App Service.
// Vite copies this file into dist/, which is deployed without node_modules,
// so it uses only Node built-ins. Its job is to add the security response
// headers that `pm2 serve` cannot set.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const INDEX = path.join(ROOT, 'index.html');

// Keep in sync with the backend's security headers (ChamboMetadataTaggerBackend/Program.cs).
// CSP allowances: blob SAS previews (img/video/iframe/fetch) and MSAL sign-in/silent renewal.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: blob: https://*.blob.core.windows.net",
    "media-src 'self' blob: https://*.blob.core.windows.net",
    "frame-src 'self' https://*.blob.core.windows.net https://login.microsoftonline.com",
    "connect-src 'self' https://login.microsoftonline.com https://*.blob.core.windows.net",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer-when-downgrade',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const filePath = path.resolve(ROOT, '.' + decoded);
  if (!filePath.startsWith(ROOT + path.sep) || filePath === __filename) return null;
  try {
    return fs.statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

const server = http.createServer((req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const urlPath = new URL(req.url, 'http://localhost').pathname;
  // Unknown paths fall back to index.html so client-side routes work.
  const filePath = resolveFile(urlPath) || INDEX;
  const cacheControl = urlPath.startsWith('/assets/')
    ? 'public, max-age=31536000, immutable'
    : filePath === INDEX ? 'no-cache' : 'public, max-age=3600';

  fs.stat(filePath, (statErr, stat) => {
    if (statErr) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} on port ${PORT}`);
});
