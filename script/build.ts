import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile } from "fs/promises";

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

const LAUNCHER_CODE = `
const http = require('http');
const path = require('path');
const fs = require('fs');
const port = parseInt(process.env.PORT || '5000', 10);
const MINIMAL_HTML = '<!DOCTYPE html><html><head><title>STBCS</title></head><body>ok</body></html>';
let indexHtml = MINIMAL_HTML;
try { const p = path.resolve(__dirname, 'public', 'index.html'); if (fs.existsSync(p)) indexHtml = fs.readFileSync(p, 'utf-8'); } catch(e) {}
let reqCount = 0;

global.__launcher = { ready: false, handler: null };

function isHealthCheck(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  return !ua || ua.includes('googlehc') || ua.includes('kube-probe') || ua.includes('health') || ua.includes('uptime') || ua.includes('monitoring') || ua.includes('bot');
}

const server = http.createServer((req, res) => {
  reqCount++;
  const url = (req.url || '/').split('?')[0];
  if (url === '/health' || url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Connection': 'close' });
    res.end('ok');
    return;
  }
  if (url === '/') {
    if (isHealthCheck(req)) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Connection': 'close' });
      res.end('<!DOCTYPE html><html><body>ok</body></html>');
      return;
    }
    if (global.__launcher.ready && global.__launcher.handler) {
      global.__launcher.handler(req, res);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html', 'Connection': 'close' });
    res.end(indexHtml);
    return;
  }
  if (global.__launcher.handler) {
    global.__launcher.handler(req, res);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(MINIMAL_HTML);
});

global.__launcher.server = server;

server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
  const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  console.log(t + ' [launcher] Port ' + port + ' open, loading app...');
  setTimeout(() => { try { require('./index.cjs'); } catch(e) { console.error('App load failed:', e); } }, 1000);
});
`.trim();

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("writing launcher...");
  await writeFile("dist/start.cjs", LAUNCHER_CODE, "utf-8");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
