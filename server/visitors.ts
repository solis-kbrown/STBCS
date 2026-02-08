import { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import { storage } from "./storage";
import { createLogger } from "./logger";

const log = createLogger("Visitors");

function hashVisitor(req: Request): string {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex").slice(0, 32);
}

export function visitorTrackingMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api") && req.method === "GET") {
      try {
        const visitorHash = hashVisitor(req);
        const alreadyTracked = req.cookies?.stbcs_v;
        if (!alreadyTracked) {
          res.cookie("stbcs_v", "1", {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }
        await storage.trackVisitor(visitorHash);
      } catch (err) {
        log.debug("Visitor tracking error:", err);
      }
    }
    next();
  };
}
