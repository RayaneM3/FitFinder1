import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use(express.static(distPath));

  // Dynamic meta tags for trainer profile pages
  app.get("/profile/:id", async (req, res) => {
    try {
      const trainer = await storage.getTrainerDetails(req.params.id);
      if (!trainer) {
        return res.send(indexHtml);
      }

      const title = `${trainer.name}${trainer.specialties?.[0] ? ` — ${trainer.specialties[0]} Coach` : ""}${trainer.city ? ` in ${trainer.city}` : ""} | Fit Finder`;
      const description = (trainer.bio || "Fitness trainer on Fit Finder").slice(0, 160);
      const url = `${process.env.APP_URL || "https://fitfinder.co"}/profile/${req.params.id}`;

      const baseUrl = process.env.APP_URL || "https://fitfinder.co";
      const ogImageUrl = `${baseUrl}/api/og/${req.params.id}.png`;

      const html = indexHtml
        .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
        .replace(
          "</head>",
          `<meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
    </head>`
        );

      return res.send(html);
    } catch {
      return res.send(indexHtml);
    }
  });

  // Fall through to index.html for all other routes
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
