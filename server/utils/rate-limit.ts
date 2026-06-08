import { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

export function cfAwareKeyGenerator(req: Request): string {
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp) return ipKeyGenerator(cfIp);
  return ipKeyGenerator(req.ip ?? "unknown");
}
