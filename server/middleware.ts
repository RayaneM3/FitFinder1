import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Attach the authenticated user to every protected request so route handlers
// can read req.user without a second DB round-trip.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.bannedAt) {
    return res.status(403).json({ message: "Account suspended" });
  }
  req.user = user;
  next();
}

export function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ message: "Please verify your email address before continuing.", code: "EMAIL_NOT_VERIFIED" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.bannedAt) {
    return res.status(403).json({ message: "Account suspended" });
  }
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = user;
  next();
}
