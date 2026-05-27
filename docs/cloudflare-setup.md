# Fit Finder — Cloudflare Setup Guide

Cloudflare sits in front of Railway as a WAF and CDN layer. This guide walks through the complete setup from DNS to firewall rules.

---

## Prerequisites

- A Cloudflare account (free plan is sufficient for getting started)
- Your Railway backend domain (e.g. `fitfinder-production.up.railway.app`)
- Your custom domain (e.g. `api.fitfinder.co` or `fitfinder.co`)

---

## 1. Add your domain to Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a Site** → enter your domain.
2. Select the **Free** plan (or higher if you need advanced WAF rules).
3. Cloudflare will scan your existing DNS records. Review and import them.
4. Update your domain registrar's nameservers to the two Cloudflare nameservers shown.
5. Wait for propagation (usually < 30 minutes; check with `dig NS yourdomain.com`).

---

## 2. Add a DNS record for the Railway backend

| Type  | Name  | Content                                    | Proxy status |
|-------|-------|--------------------------------------------|--------------|
| CNAME | `api` | `fitfinder-production.up.railway.app`      | ✅ Proxied   |

> If your frontend and backend share one domain (monolith on Railway), use an `A` or `CNAME` record pointing to the Railway service URL.

The orange cloud (proxied) means traffic flows through Cloudflare — this is required for WAF, caching, and Bot Fight Mode to work.

---

## 3. Set SSL/TLS mode to Full (Strict)

1. Cloudflare dashboard → **SSL/TLS** → **Overview**
2. Select **Full (Strict)**

This ensures Cloudflare validates Railway's TLS certificate end-to-end. **Do not use Flexible** — it sends unencrypted traffic from Cloudflare to Railway.

Railway provides valid TLS certificates automatically for `*.up.railway.app` domains.

---

## 4. Page Rules — bypass cache for API routes

All `/api/*` requests must reach Railway directly (no Cloudflare edge caching of API responses).

1. **Rules** → **Page Rules** → **Create Page Rule**
2. URL pattern: `api.fitfinder.co/api/*`
3. Setting: **Cache Level** → **Bypass**
4. Save and deploy.

> Alternatively use **Cache Rules** (newer UI) with the same effect.

---

## 5. Page Rules — cache static sitemap and robots

These files change infrequently and benefit from edge caching.

**Rule 1 — sitemap:**
- URL: `api.fitfinder.co/sitemap.xml`
- Setting: **Cache Level** → **Cache Everything**
- **Edge Cache TTL** → **1 day**

**Rule 2 — robots:**
- URL: `api.fitfinder.co/robots.txt`
- Setting: **Cache Level** → **Cache Everything**
- **Edge Cache TTL** → **1 day**

---

## 6. Enable Bot Fight Mode

1. **Security** → **Bots** → toggle **Bot Fight Mode** to **On**

This blocks known bad bots at the Cloudflare edge before they reach Railway, reducing load and protecting against scraping.

> For more granular control (allow Googlebot but block others), upgrade to the **Pro** plan and use **Super Bot Fight Mode**.

---

## 7. Cloudflare Rate Limiting (second layer)

Your Express app already rate-limits at 100 req/min per IP. Add a Cloudflare rule as a second layer to block volumetric abuse before it hits Railway.

1. **Security** → **WAF** → **Rate Limiting Rules** → **Create Rule**
2. Configure:
   - **Rule name:** `API abuse — 5xx spike`
   - **Expression:** `(http.request.uri.path matches "^/api/") and (http.response.code ge 500)`
   - **Action:** Block
   - **Requests:** 10 errors within 1 minute per IP
3. Save.

> Note: Cloudflare's free plan allows 1 rate-limiting rule. The Pro plan lifts this restriction.

---

## 8. Allowlist Cloudflare IPs — block direct Railway access

To prevent attackers from bypassing Cloudflare by hitting the Railway URL directly (`fitfinder-production.up.railway.app`), add a Railway custom domain and restrict incoming traffic to Cloudflare IP ranges.

### 8a. Add a custom domain on Railway

1. Railway dashboard → your service → **Settings** → **Custom Domains** → add `api.fitfinder.co`.
2. Railway will show a CNAME target — use this in your Cloudflare DNS record (step 2).

### 8b. Configure Railway network policies (if available)

Railway does not yet expose IP allowlist controls in the UI. Until it does, the defence-in-depth approach is:

1. **Do not publish** the `*.up.railway.app` URL publicly — only expose the Cloudflare-proxied custom domain.
2. In your Express app, validate the `CF-Connecting-IP` header presence as a soft signal:

```typescript
// Optional: reject requests that arrive without a Cloudflare IP header
// (only enable this once TRUST_PROXY=true is confirmed working)
app.use((req, res, next) => {
  if (process.env.REQUIRE_CLOUDFLARE === "true" && !req.headers["cf-connecting-ip"]) {
    return res.status(403).json({ message: "Direct access not allowed" });
  }
  next();
});
```

3. Set `REQUIRE_CLOUDFLARE=true` only after confirming all legitimate traffic (including Railway health checks and Stripe webhooks) arrives via Cloudflare.

---

## 9. App-side changes (already applied)

The following changes are already in `server/index.ts`:

| Change | Why |
|--------|-----|
| `TRUST_PROXY=true` env var | Makes `req.ip` reflect the real client IP from Cloudflare's `CF-Connecting-IP` header |
| `keyGenerator` reads `cf-connecting-ip` header | Rate limiting operates on the real client IP, not Cloudflare's proxy IP |
| `Vary: Accept-Encoding` header on all responses | Prevents Cloudflare from serving a compressed response to a client expecting uncompressed |

### Railway environment variables to add

```
TRUST_PROXY=true
```

Add this in the Railway service **Variables** tab for both production and staging.

---

## 10. Verify the setup

After everything is configured:

```bash
# Should return the real client IP (not Cloudflare's IP) in the X-Forwarded-For header
curl -I https://api.fitfinder.co/api/health

# Should show Cloudflare headers
curl -v https://api.fitfinder.co/api/health 2>&1 | grep -i "cf-"
```

Expected Cloudflare headers on responses:
- `CF-Cache-Status: DYNAMIC` (for `/api/*` routes — confirms bypass rule is working)
- `CF-Cache-Status: HIT` or `MISS` (for `/sitemap.xml` — confirms caching rule works)

---

## Quick reference — Cloudflare dashboard sections

| Goal | Dashboard path |
|------|---------------|
| DNS records | Websites → your domain → DNS → Records |
| SSL mode | Websites → your domain → SSL/TLS → Overview |
| Page Rules / Cache Rules | Websites → your domain → Rules |
| Bot Fight Mode | Websites → your domain → Security → Bots |
| Rate Limiting | Websites → your domain → Security → WAF → Rate Limiting Rules |
| Cloudflare IP ranges | [cloudflare.com/ips](https://www.cloudflare.com/ips/) |
