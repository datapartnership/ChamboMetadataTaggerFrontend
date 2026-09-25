import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Configure upstream APIM details
const APIM_TARGET = process.env.APIM_TARGET_URL || 'https://my-apim-instance.azure-api.net';
const APIM_KEY = process.env.APIM_SUBSCRIPTION_KEY;

// 1. Reverse proxy /api requests to APIM
app.use(
  '/api',
  createProxyMiddleware({
    target: APIM_TARGET,
    changeOrigin: true,
    secure: true,
    logger: console,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${APIM_TARGET}${req.url}`);
        if (APIM_KEY) {
          proxyReq.setHeader('Ocp-Apim-Subscription-Key', APIM_KEY);
        }
      },
      error: (err, req, res) => {
        console.error(`[Proxy Error] Target: ${APIM_TARGET} | Reason: ${err.message}`);
        if (!res.headersSent) {
          res.status(504).json({
            error: 'Gateway Timeout / Connection Failed',
            details: err.message,
            target: APIM_TARGET,
          });
        }
      },
    },
  })
);

// 2. Serve static assets from dist
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// 3. SPA catch-all fallback
app.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Proxying /api/* requests to: ${APIM_TARGET}`);
});