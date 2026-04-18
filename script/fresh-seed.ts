/**
 * fresh-seed.ts — Standalone script that pushes the Drizzle schema
 * to a fresh database and then runs the seed.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx script/fresh-seed.ts
 *
 * This is useful when setting up a new Railway (or similar) database
 * from scratch without migrating data from a local instance.
 */

import { execSync } from "child_process";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  console.log("▸ Step 1/2 — Pushing schema with drizzle-kit...");
  execSync("npx drizzle-kit push", { stdio: "inherit" });
  console.log("  ✓ Schema pushed\n");

  console.log("▸ Step 2/2 — Running seed...");
  // Dynamic import so the seed picks up the DATABASE_URL from env
  const { runSeedIfNeeded } = await import("../server/seed");
  await runSeedIfNeeded();
  console.log("  ✓ Seed complete\n");

  console.log("══════════════════════════════════════");
  console.log("  Fresh database is ready!");
  console.log("══════════════════════════════════════");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
