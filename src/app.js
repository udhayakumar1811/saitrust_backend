const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const path = require('path');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { UPLOADS_DIR } = require('./utils/storage');

const app = express();

// Behind a cloud load balancer/reverse proxy (Render, Railway, Heroku, nginx,
// etc.) so rate limiting and secure cookies see the real client IP/protocol.
app.set('trust proxy', 1);

// ---- Security & parsing middleware ----------------------------------------
// crossOriginResourcePolicy: 'cross-origin' — without this, Helmet's
// default 'same-origin' policy blocks the frontend (a different origin,
// e.g. Vercel) from loading <img>/<video> served from /uploads on this
// backend (e.g. Render). Images would upload fine but silently fail to
// display on the public site.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize()); // strips $/. operators from user input (NoSQL injection)
app.use(xssClean()); // sanitizes user input against basic XSS payloads

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---- CORS -------------------------------------------------------------
// Comma-separated allowlist in CLIENT_ORIGIN so both the public site and the
// Admin Panel (served from different origins/ports) can call this API.
// Trailing slashes are stripped so "http://localhost:5173/" in the env var
// still matches the "http://localhost:5173" Origin header browsers send.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Any localhost/127.0.0.1 origin (on any port) is always allowed, no matter
// what CLIENT_ORIGIN is set to on the host. This is what lets a developer
// run `npm run dev` (Vite on localhost:5173) against the *deployed* Render
// backend without CLIENT_ORIGIN ever needing to be touched — and it's what
// was missing before, which is why every request from localhost:5173 was
// failing the CORS preflight with "No 'Access-Control-Allow-Origin' header".
const isLocalhost = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) with no Origin header, any
      // localhost origin (dev), and any origin explicitly listed in
      // CLIENT_ORIGIN. If CLIENT_ORIGIN is unset entirely, allow everything
      // (useful for quick previews) — but log a warning since that's not
      // safe for a real production deployment.
      const cleanOrigin = origin ? origin.replace(/\/+$/, '') : origin;
      if (!origin || isLocalhost(cleanOrigin) || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      if (allowedOrigins.length === 0) {
        console.warn('[cors] CLIENT_ORIGIN is not set — allowing all origins. Set CLIENT_ORIGIN in production.');
        return callback(null, true);
      }
      console.warn(`[cors] Blocked request from origin "${origin}" — add it to CLIENT_ORIGIN if this should be allowed.`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ---- General rate limiting -------------------------------------------
// A looser, API-wide limit; auth routes have their own stricter limiter
// (middleware/rateLimiters.js) applied directly on top of this one.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- Static file serving (local upload driver) -------------------------
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// ---- API routes ---------------------------------------------------------
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ success: true, data: { name: 'SAI Trust API', status: 'running' } });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
