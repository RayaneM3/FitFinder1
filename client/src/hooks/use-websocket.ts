import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE } from "@/lib/queryClient";

export function useWebSocket(isAuthenticated: boolean) {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    let wsUrl: string;
    // Prefer an explicit WS URL (set when HTTP is proxied same-origin but the
    // WS server lives on a different host that the proxy can't upgrade to).
    const explicitWs = import.meta.env.VITE_WS_URL as string | undefined;
    const wsBase = explicitWs || API_BASE;
    if (wsBase) {
      // Cross-origin: derive WS host from the base URL (e.g. https://api.fitfinder.co → wss://api.fitfinder.co/ws)
      const url = new URL(wsBase);
      const wsProt = url.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${wsProt}//${url.host}/ws`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      // Send ping every 25 seconds
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "pong") {
          setLastMessage(data);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Don't reconnect if closed intentionally (4001 = unauthorized)
      if (event.code === 4001) return;

      // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
      reconnectAttemptRef.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { lastMessage };
}
