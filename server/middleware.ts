import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

/**
 * Wraps async route handlers to properly catch and forward errors to Express.
 * Existing routes should be migrated to use this wrapper over time.
 */
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
  next();
}
