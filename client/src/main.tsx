import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

// Initialise Sentry only when VITE_SENTRY_DSN is set.
// In local dev the var is absent, so no data is sent.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    // Capture 10% of page-load transactions; adjust when traffic grows.
    tracesSampleRate: 0.1,
    // Session replay disabled — enable only if GDPR consent is in place.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
