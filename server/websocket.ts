import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import cookie from "cookie";
import signature from "cookie-signature";
import { pool } from "./db";

const connections = new Map<string, Set<WebSocket>>();

export function isUserOnline(userId: string): boolean {
  const userConns = connections.get(userId);
  return !!userConns && userConns.size > 0;
}

export function broadcastToUser(userId: string, payload: object) {
  const userConns = connections.get(userId);
  if (!userConns) return;
  const data = JSON.stringify(payload);
  userConns.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

async function getSessionUserId(cookieHeader: string | undefined): Promise<string | null> {
  if (!cookieHeader) return null;

  const cookies = cookie.parse(cookieHeader);
  let sid = cookies["connect.sid"];
  if (!sid) return null;

  // Remove the "s:" prefix and unsign
  if (sid.startsWith("s:")) {
    sid = sid.slice(2);
  }

  const secret = process.env.SESSION_SECRET || "fit-finder-dev-secret-change-in-production";
  const unsigned = signature.unsign(sid, secret);
  if (unsigned === false) return null;

  try {
    const result = await pool.query('SELECT sess FROM "session" WHERE sid = $1', [unsigned]);
    if (result.rows.length === 0) return null;
    const sess = typeof result.rows[0].sess === "string"
      ? JSON.parse(result.rows[0].sess)
      : result.rows[0].sess;
    return sess?.userId || null;
  } catch {
    return null;
  }
}

// Origins permitted to open a WebSocket connection. Browsers always send an
// Origin header on the WS handshake, so rejecting unknown origins prevents
// cross-site WebSocket hijacking (a malicious page opening an authenticated
// socket with the victim's cookie and reading their message broadcasts).
const allowedWsOrigins = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean) as string[];

function isAllowedWsOrigin(origin: string | undefined): boolean {
  // No Origin header → non-browser client (native app, server-to-server). Allow.
  if (!origin) return true;
  return allowedWsOrigins.includes(origin);
}

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Ping all connections every 30 seconds
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(pingInterval));

  wss.on("connection", async (ws: any, req) => {
    // Reject cross-site connections before touching the session.
    if (!isAllowedWsOrigin(req.headers.origin)) {
      console.warn(`[ws] Blocked connection from origin: ${req.headers.origin}`);
      ws.close(4003, "Forbidden origin");
      return;
    }

    const userId = await getSessionUserId(req.headers.cookie);
    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    ws.isAlive = true;
    ws.userId = userId;

    // Track connection
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId)!.add(ws);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      const userConns = connections.get(userId);
      if (userConns) {
        userConns.delete(ws);
        if (userConns.size === 0) {
          connections.delete(userId);
        }
      }
    });
  });
}
