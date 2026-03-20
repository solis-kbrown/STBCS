import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const STARTUP_HTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>STB Cybersecurity</title></head><body><div id="root"></div></body></html>';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || "5000", 10);

let appReady = false;
let expressApp: express.Express | null = null;

let cachedIndexHtml: string | null = null;
if (IS_PRODUCTION) {
  try {
    const indexPath = path.resolve(__dirname, "public", "index.html");
    if (fs.existsSync(indexPath)) {
      cachedIndexHtml = fs.readFileSync(indexPath, 'utf-8');
    }
  } catch {}
}

let seoIndexHtml: string | null = null;

const httpServer = createServer((req, res) => {
  const url = req.url || '/';
  const urlPath = url.split('?')[0];

  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Connection': 'close' });
    res.end('{"status":"ok"}');
    return;
  }

  if (expressApp) {
    expressApp(req, res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(cachedIndexHtml || STARTUP_HTML);
  }
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

async function initWithRetry(maxRetries = 10) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initializeApp();
      return;
    } catch (err: any) {
      const isDbError = err?.message?.includes('endpoint') || err?.code === 'XX000' || err?.code === 'ECONNREFUSED' || err?.message?.includes('database') || err?.message?.includes('connect');
      const waitSec = Math.min(attempt * 1, 5);
      if (isDbError && attempt < maxRetries) {
        console.error(`App init attempt ${attempt}/${maxRetries} failed (DB issue): ${err.message}. Retrying in ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      } else if (attempt < maxRetries) {
        console.error(`App init attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      } else {
        console.error("App initialization failed after all retries:", err);
        console.error("Server will remain alive for health checks. Scheduling retry in 30s...");
        setTimeout(() => { initWithRetry(maxRetries).catch(e => console.error("Re-init failed:", e)); }, 30000);
        return;
      }
    }
  }
}

httpServer.listen(
  { port, host: "0.0.0.0", reusePort: true },
  () => {
    log(`serving on port ${port}`);
    appReady = true;
    initWithRetry().catch(err => console.error('Init failed:', err));
  },
);

async function yieldToEventLoop() {
  return new Promise<void>(resolve => setImmediate(resolve));
}

async function staggeredStartup(port: number) {
  log("Staggered startup: deferring background services (60s+ after health checks)");

  setTimeout(async () => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;
      const { storage } = await import("./storage");
      const adminUser = await storage.getUserByEmail(adminEmail);
      if (adminUser && (adminUser.tier === "free" || !adminUser.isAdmin)) {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`UPDATE users SET is_admin = true, is_trusted = true, tier = 'unlimited' WHERE id = ${adminUser.id}`);
        console.log(`[Admin] Upgraded ${adminUser.username} (${adminEmail}) to unlimited/admin`);
      }
    } catch (err) {
      console.error("Admin upgrade check failed:", err);
    }
  }, 2000);

  setTimeout(async () => {
    try {
      const { startDigestScheduler } = await import("./digest");
      startDigestScheduler();
    } catch (err) {
      console.error("Digest scheduler failed:", err);
    }
  }, 5000);

  setTimeout(async () => {
    try {
      const { startMaintenanceScheduler } = await import("./maintenance");
      startMaintenanceScheduler();
    } catch (err) {
      console.error("Maintenance scheduler failed:", err);
    }
  }, 8000);

  setTimeout(async () => {
    try {
      const { startKbScraper, ensureSeedMembers } = await import("./kbScraper");
      startKbScraper();
      ensureSeedMembers().catch(err => console.error("Seed members failed:", err));
    } catch (err) {
      console.error("KB scraper failed:", err);
    }
  }, 11000);

  setTimeout(async () => {
    try {
      const { startUptimeScheduler } = await import("./uptimeEngine");
      startUptimeScheduler(300);
    } catch (err) {
      console.error("Uptime scheduler failed:", err);
    }
  }, 14000);

  setTimeout(async () => {
    try {
      const { startDarkWebScheduler } = await import("./darkWebEngine");
      startDarkWebScheduler(360);
    } catch (err) {
      console.error("Dark web scheduler failed:", err);
    }
  }, 17000);

  setTimeout(() => {
    initStripe().catch(err => console.error("Deferred Stripe init failed:", err));
  }, 20000);

  setTimeout(async () => {
    try {
      const { startDataRefreshScheduler } = await import("./scrapers");
      startDataRefreshScheduler(15);
    } catch (err) {
      console.error("Scraper scheduler failed:", err);
    }
  }, 23000);

  setTimeout(async () => {
    try {
      const base = `http://127.0.0.1:${port}`;
      const urls = ["/api/stats", "/api/trends", "/api/cves", "/api/ransomware",
        "/api/site-settings/hero-bg", "/api/site-settings/logo-theme", "/api/site-settings/icon-theme"];
      for (const u of urls) {
        await fetch(base + u).catch(() => {});
        await yieldToEventLoop();
      }
      log("Cache warm-up complete");
    } catch {}
  }, 26000);

  setTimeout(async () => {
    try {
      const { generateAndStoreBulletin } = await import("./phishing-bulletin");
      const { storage } = await import("./storage");

      const existing = await storage.getLatestBulletin("daily");
      if (!existing) {
        log("No awareness bulletins found — generating initial bulletin");
        await generateAndStoreBulletin("daily");
      }

      let lastDailyDate = "";
      let lastWeeklyDate = "";

      const checkAndGenerate = async () => {
        try {
          const now = new Date();
          const utcHour = now.getUTCHours();
          const utcDay = now.getUTCDay();
          const dateKey = now.toISOString().slice(0, 10);

          if (utcHour === 7 && lastDailyDate !== dateKey) {
            await generateAndStoreBulletin("daily");
            lastDailyDate = dateKey;

            if (utcDay === 1 && lastWeeklyDate !== dateKey) {
              await generateAndStoreBulletin("weekly");
              lastWeeklyDate = dateKey;
            }
          }
        } catch (err) {
          console.error("[Awareness] Scheduler tick error:", err);
        }
      };

      setInterval(checkAndGenerate, 3_600_000);
      log("Awareness bulletin scheduler started (daily 07:00 UTC)");
    } catch (err) {
      console.error("Awareness scheduler failed:", err);
    }
  }, 29000);
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
        index: false,
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

  await yieldToEventLoop();

  app.get('/health', (_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Connection': 'close' });
    res.end('{"status":"ok"}');
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

  const [
    { registerRoutes },
    { reportCriticalError },
    { registerRDPRoutes, setupRDPWebSocket },
    { registerSSHRoutes, setupSSHWebSocket },
    { registerTelnetRoutes, setupTelnetWebSocket },
    { registerSFTPRoutes },
  ] = await Promise.all([
    import("./routes"),
    import("./maintenance"),
    import("./rdp"),
    import("./ssh"),
    import("./telnet"),
    import("./sftp"),
  ]);

  await registerRoutes(httpServer, app);
  await yieldToEventLoop();

  registerRDPRoutes(app);
  setupRDPWebSocket(httpServer);
  registerSSHRoutes(app);
  setupSSHWebSocket(httpServer);
  registerTelnetRoutes(app);
  setupTelnetWebSocket(httpServer);
  registerSFTPRoutes(app);

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
    seoIndexHtml = injectMetaTags(baseHtml, '/');
    app.get('/{*path}', (req, res, next) => {
      if (req.path === '/health') {
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

  await yieldToEventLoop();

  setImmediate(() => {
    staggeredStartup(port).catch(err => console.error("Staggered startup error:", err));
  });

  expressApp = app;

  log("Routes and static serving initialized");
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
    console.log('Initializing Stripe...');
    const { getUncachableStripeClient } = await import("./stripeClient");
    const stripe = await getUncachableStripeClient();
    await stripe.products.list({ limit: 1 });
    console.log('Stripe connection verified');

    const customDomain = process.env.CUSTOM_DOMAIN;
    const baseUrl = process.env.BASE_URL;
    let webhookBaseUrl: string | null = null;
    if (customDomain) {
      webhookBaseUrl = `https://${customDomain}`;
    } else if (baseUrl) {
      webhookBaseUrl = baseUrl.replace(/\/+$/, '');
    }
    if (webhookBaseUrl) {
      console.log(`Webhook URL base: ${webhookBaseUrl}/api/stripe/webhook`);
    } else {
      console.log('No CUSTOM_DOMAIN or BASE_URL set, configure webhook URL manually in Stripe Dashboard');
    }
    console.log('Stripe initialization complete');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}
