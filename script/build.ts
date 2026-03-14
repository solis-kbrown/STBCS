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
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = parseInt(process.env.PORT || '5000', 10);
const STARTUP_HTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>STB Cybersecurity</title></head><body><div id="root"></div></body></html>';
let indexHtml = STARTUP_HTML;
try { const p = path.resolve(__dirname, 'public', 'index.html'); if (fs.existsSync(p)) indexHtml = fs.readFileSync(p, 'utf-8'); } catch(e) {}

global.__launcher = { ready: false, handler: null };

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Connection': 'close' });
    res.end('{"status":"ok"}');
    return;
  }
  if (url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Connection': 'close' });
    res.end('ok');
    return;
  }
  if (global.__launcher.handler) {
    global.__launcher.handler(req, res);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(indexHtml);
});

global.__launcher.server = server;

server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
  const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  console.log(t + ' [launcher] Port ' + port + ' open, loading app...');
  setTimeout(() => { import('./index.js').catch(e => console.error('App load failed:', e)); }, 100);
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
    format: "esm",
    outfile: "dist/index.js",
    banner: {
      js: `import { createRequire as __createRequire } from 'module';import { fileURLToPath as __fileURLToPath } from 'url';import { dirname as __dirname_fn } from 'path';const require = __createRequire(import.meta.url);const __filename = __fileURLToPath(import.meta.url);const __dirname = __dirname_fn(__filename);`,
    },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("writing launcher...");
  await writeFile("dist/start.js", LAUNCHER_CODE, "utf-8");

  const CJS_WRAPPER = `import('./start.js').catch(e => { console.error('Failed to start:', e); process.exit(1); });\n`;
  await writeFile("dist/index.cjs", CJS_WRAPPER, "utf-8");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
