import sharp from "sharp";
import { storage } from "./storage";

export async function generateTrainerOgImage(trainerId: string): Promise<Buffer | null> {
  const trainer = await storage.getTrainerDetails(trainerId);
  if (!trainer) return null;

  const name = trainer.name || "Trainer";
  const specialty =
    trainer.specialties && trainer.specialties.length > 0
      ? trainer.specialties.slice(0, 3).join(" · ")
      : "Personal Trainer";
  const location = [trainer.city, trainer.country].filter(Boolean).join(", ") || "";
  const initial = name.charAt(0).toUpperCase();

  // 1200×630 OG image
  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect x="0" y="580" width="1200" height="50" fill="#3b82f6"/>

  <!-- Logo mark -->
  <rect x="60" y="40" width="48" height="48" rx="12" fill="#3b82f6"/>
  <text x="84" y="72" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">F</text>
  <text x="124" y="72" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Fit Finder</text>

  <!-- Avatar circle -->
  <circle cx="600" cy="240" r="70" fill="#1e3a5f"/>
  <text x="600" y="260" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#60a5fa" text-anchor="middle">${escapeXml(initial)}</text>

  <!-- Trainer name -->
  <text x="600" y="360" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle">${escapeXml(truncate(name, 30))}</text>

  <!-- Specialty -->
  <text x="600" y="410" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">${escapeXml(truncate(specialty, 50))}</text>

  <!-- Location -->
  <text x="600" y="460" font-family="Arial, sans-serif" font-size="20" fill="#64748b" text-anchor="middle">${escapeXml(truncate(location, 40))}</text>

  <!-- Bottom bar text -->
  <text x="600" y="612" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">Find your personal trainer at fitfinder.co</text>
</svg>`.trim();

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
