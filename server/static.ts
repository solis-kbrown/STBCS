import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectMetaTags } from "./seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");
  const baseHtml = fs.readFileSync(indexPath, "utf-8");

  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      }
      if (filePath.match(/\.(js|css|woff2?|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  app.use("/{*path}", (req, res) => {
    const html = injectMetaTags(baseHtml, req.originalUrl);
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.setHeader("Vary", "Accept-Encoding");
    res.send(html);
  });
}
