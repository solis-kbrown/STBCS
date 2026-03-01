import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const STARTUP_HTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>STB Cybersecurity</title><meta http-equiv="refresh" content="3"></head><body style="background:#18181b;color:#a1a1aa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>Initializing threat intelligence platform...</p></body></html>';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || "5000", 10);

let appReady = false;
let expressApp: express.Express | null = null;

const httpServer = createServer((req, res) => {
  if (!appReady || !expressApp) {
    if (req.url === '/health' || req.url === '/health?') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', ready: appReady, timestamp: Date.now() }));
      return;
    }
    if (req.url === '/__repl') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }
    if (req.url === '/' || (req.method === 'GET' && !req.url?.startsWith('/api/'))) {
      if (IS_PRODUCTION) {
        const indexPath = path.resolve(__dirname, "public", "index.html");
        try {
          if (fs.existsSync(indexPath)) {
            const html = fs.readFileSync(indexPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
            return;
          }
        } catch {}
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(STARTUP_HTML);
      return;
    }
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Service starting up, please retry shortly" }));
    return;
  }
  expressApp(req, res);
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

httpServer.listen(
  { port, host: "0.0.0.0", reusePort: true },
  () => {
    log(`serving on port ${port}`);
    setImmediate(() => {
      initializeApp().catch((err) => {
        console.error("Fatal: App initialization failed:", err);
        process.exit(1);
      });
    });
  },
);

async function yieldToEventLoop() {
  return new Promise<void>(resolve => setImmediate(resolve));
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

async function initializeApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const compression = (await import("compression")).default;
  await yieldToEventLoop();

  const PRIMARY_DOMAIN = process.env.CUSTOM_DOMAIN || 'stbcybersecurity.com';
  const SECONDARY_DOMAINS = ['www.stbcybersecurity.com', 'stoptbcs.com', 'www.stoptbcs.com'];

  if (IS_PRODUCTION) {
    const distPath = path.resolve(__dirname, "public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
          }
          if (filePath.match(/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|webp|avif|svg|gif|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      }));
      log("Static file serving initialized early for fast startup");
    }
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', ready: appReady, timestamp: Date.now() });
  });

  app.get('/__repl', (_req, res) => {
    res.status(200).send('ok');
  });

  app.use((req, res, next) => {
    const host = req.get('host')?.split(':')[0];
    if (host && (SECONDARY_DOMAINS.includes(host) || host === `www.${PRIMARY_DOMAIN}`)) {
      return res.redirect(301, `https://${PRIMARY_DOMAIN}${req.originalUrl}`);
    }
    next();
  });

  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(self)');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    const scriptSrc = IS_PRODUCTION
      ? "script-src 'self' 'unsafe-inline' https://js.stripe.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com";
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.stripe.com https://*.stripe.com https://r.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join('; '));
    const reqPath = req.path;
    if (reqPath.startsWith('/api/') || reqPath.startsWith('/checkout') || reqPath === '/account' || reqPath === '/messages' || reqPath === '/style-preview') {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
  });

  const ALLOWED_ORIGINS = new Set([
    `https://${PRIMARY_DOMAIN}`,
    `https://www.${PRIMARY_DOMAIN}`,
    ...SECONDARY_DOMAINS.map(d => `https://${d}`),
  ]);
  app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.path === '/api/stripe/webhook') return next();
    if (req.path.startsWith('/api/v1/')) return next();
    const origin = req.get('origin');
    const referer = req.get('referer');
    if (!IS_PRODUCTION) return next();
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!origin && referer) {
      try {
        const refOrigin = new URL(referer).origin;
        if (!ALLOWED_ORIGINS.has(refOrigin)) {
          return res.status(403).json({ error: "Forbidden" });
        }
      } catch { /* invalid referer, allow through */ }
    }
    if (!origin && !referer) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });

  app.use(compression());

  await yieldToEventLoop();

  const { WebhookHandlers } = await import("./webhookHandlers");
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        if (!Buffer.isBuffer(req.body)) {
          console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
          return res.status(400).json({ error: 'Invalid request body' });
        }
        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook signature verification failed' });
      }
    }
  );

  app.use(
    express.json({
      verify: (req, _res, buf) => { req.rawBody = buf; },
      limit: '1mb',
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  const SENSITIVE_PATHS = new Set(['/api/auth/signup', '/api/auth/login', '/api/auth/me', '/api/auth/logout', '/api/stripe/webhook']);
  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith("/api")) {
        let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse && !SENSITIVE_PATHS.has(reqPath)) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });
    next();
  });

  await yieldToEventLoop();

  const { registerRoutes } = await import("./routes");
  const { reportCriticalError } = await import("./maintenance");

  await yieldToEventLoop();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const internalMessage = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (status >= 500) {
      reportCriticalError(err instanceof Error ? err : new Error(internalMessage), "Express Error Handler");
    }
    if (res.headersSent) {
      return next(err);
    }
    const safeMessage = status >= 500 ? "An internal error occurred. Please try again later." : internalMessage;
    return res.status(status).json({ error: safeMessage });
  });

  if (IS_PRODUCTION) {
    const { injectMetaTags } = await import("./seo");
    const distPath = path.resolve(__dirname, "public");
    const indexPath = path.resolve(distPath, "index.html");
    const baseHtml = fs.readFileSync(indexPath, "utf-8");
    app.use("/{*path}", (req, res, next) => {
      if (req.path === '/health' || req.path === '/__repl') {
        return next();
      }
      const html = injectMetaTags(baseHtml, req.originalUrl);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
      res.setHeader("Vary", "Accept-Encoding");
      res.send(html);
    });
  } else {
    const { injectMetaTags } = await import("./seo");
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/@') || req.path.includes('.')) {
        return next();
      }
      const originalEnd = res.end.bind(res);
      res.end = function(chunk?: any, ...args: any[]) {
        if (typeof chunk === 'string' && chunk.includes('<!DOCTYPE html>')) {
          chunk = injectMetaTags(chunk, req.originalUrl);
        }
        return originalEnd(chunk, ...args);
      } as any;
      next();
    });
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  expressApp = app;
  appReady = true;
  log("Routes and static serving initialized");

  setTimeout(async () => {
    try {
      await initStripe();
    } catch (err) {
      console.error("Deferred Stripe init failed:", err);
    }

    try {
      const { startDataRefreshScheduler } = await import("./scrapers");
      startDataRefreshScheduler(15);
    } catch (err) {
      console.error("Scraper scheduler failed:", err);
    }

    try {
      const { startDigestScheduler } = await import("./digest");
      startDigestScheduler();
    } catch (err) {
      console.error("Digest scheduler failed:", err);
    }

    try {
      const { startMaintenanceScheduler } = await import("./maintenance");
      startMaintenanceScheduler();
    } catch (err) {
      console.error("Maintenance scheduler failed:", err);
    }

    try {
      const { startUptimeScheduler } = await import("./uptimeEngine");
      startUptimeScheduler(60);
    } catch (err) {
      console.error("Uptime scheduler failed:", err);
    }

    try {
      const { startDarkWebScheduler } = await import("./darkWebEngine");
      startDarkWebScheduler(360);
    } catch (err) {
      console.error("Dark web scheduler failed:", err);
    }

    try {
      const base = `http://127.0.0.1:${port}`;
      const urls = ["/api/stats", "/api/trends", "/api/cves", "/api/ransomware",
        "/api/site-settings/hero-bg", "/api/site-settings/logo-theme", "/api/site-settings/icon-theme"];
      await Promise.all(urls.map(u => fetch(base + u).catch(() => {})));
      log("Cache warm-up complete");
    } catch {}
  }, 3000);
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('DATABASE_URL not found, skipping Stripe initialization');
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
    console.error('STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY are required. Skipping Stripe initialization.');
    return;
  }
  try {
    console.log('Initializing Stripe schema...');
    const { runMigrations } = await import('stripe-replit-sync');
    await runMigrations({ databaseUrl, schema: 'stripe' } as any);
    console.log('Stripe schema ready');
    const { getStripeSync } = await import("./stripeClient");
    const stripeSync = await getStripeSync();
    console.log('Setting up managed webhook...');
    const customDomain = process.env.CUSTOM_DOMAIN;
    const replitDomains = process.env.REPLIT_DOMAINS;
    let webhookBaseUrl: string | null = null;
    if (customDomain) {
      webhookBaseUrl = `https://${customDomain}`;
    } else if (replitDomains) {
      webhookBaseUrl = `https://${replitDomains.split(',')[0]}`;
    }
    if (webhookBaseUrl) {
      const { webhook } = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`
      );
      console.log(`Webhook configured: ${webhook?.url || 'pending'}`);
    } else {
      console.log('No domain available, skipping webhook configuration');
    }
    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => console.log('Stripe data synced'))
      .catch((err: Error) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}
