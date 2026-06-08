import { Router } from "express";
import { requireAdmin } from "../middleware";
import { pool } from "../db";
import { storage } from "../storage";
import { sendEmail } from "../email";
import { deleteImage } from "../upload";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const router = Router();

// GET /api/admin/stats
router.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [stats] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT count(*)::int FROM users) AS "totalUsers",
          (SELECT count(*)::int FROM users WHERE role IN ('TRAINER', 'BOTH') AND "onboardingComplete" = true) AS "totalTrainers",
          (SELECT count(*)::int FROM users WHERE role IN ('CLIENT', 'BOTH') AND "onboardingComplete" = true) AS "totalClients",
          (SELECT count(*)::int FROM orders WHERE status = 'PAID') AS "totalOrders",
          (SELECT coalesce(sum("amountCents"), 0)::int FROM orders WHERE status = 'PAID') AS "totalRevenue",
          (SELECT count(*)::int FROM users WHERE "createdAt" >= now() - interval '7 days') AS "recentSignups",
          (SELECT count(*)::int FROM reports WHERE status = 'OPEN') AS "openReports"
      `),
    ]);
    return res.json(stats.rows[0]);
  } catch (e) {
    console.error("[GET /api/admin/stats]:", e);
    return res.status(500).json({ message: "Failed to load stats" });
  }
});

// GET /api/admin/reports
router.get("/api/admin/reports", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id, r.category, r.details, r.status, r."createdAt",
        reporter.id AS "reporterId", reporter.name AS "reporterName", reporter.email AS "reporterEmail",
        reported.id AS "reportedId", reported.name AS "reportedName", reported.email AS "reportedEmail"
      FROM reports r
      JOIN users reporter ON reporter.id = r."reporterId"
      JOIN users reported ON reported.id = r."reportedId"
      ORDER BY r."createdAt" DESC
    `);
    return res.json(result.rows);
  } catch (e) {
    console.error("[GET /api/admin/reports]:", e);
    return res.status(500).json({ message: "Failed to load reports" });
  }
});

// PATCH /api/admin/reports/:id
router.patch("/api/admin/reports/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["REVIEWING", "CLOSED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    await pool.query(
      `UPDATE reports SET status = $1 WHERE id = $2`,
      [status, req.params.id]
    );
    return res.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/admin/reports/:id]:", e);
    return res.status(500).json({ message: "Failed to update report" });
  }
});

// GET /api/admin/users
router.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize || "20"), 10)));
    const search = String(req.query.search || "").trim();
    const offset = (page - 1) * pageSize;

    const values: any[] = [`%${search}%`, pageSize, offset];
    const result = await pool.query(
      `SELECT id, name, email, role, "onboardingComplete", "isAdmin", "bannedAt", "createdAt"
       FROM users
       WHERE ($1 = '%%' OR name ILIKE $1 OR email ILIKE $1)
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      values
    );

    const countResult = await pool.query(
      `SELECT count(*)::int AS total FROM users
       WHERE ($1 = '%%' OR name ILIKE $1 OR email ILIKE $1)`,
      [`%${search}%`]
    );

    return res.json({ users: result.rows, total: countResult.rows[0].total });
  } catch (e) {
    console.error("[GET /api/admin/users]:", e);
    return res.status(500).json({ message: "Failed to load users" });
  }
});

// POST /api/admin/users/:id/ban
router.post("/api/admin/users/:id/ban", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.session.userId) {
      return res.status(400).json({ message: "You cannot ban your own account" });
    }
    await pool.query(
      `UPDATE users SET "bannedAt" = now() WHERE id = $1`,
      [id]
    );
    // Invalidate all sessions for this user using JSONB operator (safe, indexed)
    await pool.query(
      `DELETE FROM session WHERE sess->>'userId' = $1`,
      [id]
    );
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/admin/users/:id/ban]:", e);
    return res.status(500).json({ message: "Failed to ban user" });
  }
});

// POST /api/admin/users/:id/unban
router.post("/api/admin/users/:id/unban", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE users SET "bannedAt" = NULL WHERE id = $1`,
      [id]
    );
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/admin/users/:id/unban]:", e);
    return res.status(500).json({ message: "Failed to unban user" });
  }
});

// POST /api/admin/users/:id/warn
router.post("/api/admin/users/:id/warn", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: "reason is required" });
    if (typeof reason !== "string" || reason.length > 1000) {
      return res.status(400).json({ message: "reason must be 1000 characters or less" });
    }
    const user = await storage.getUser(id as string);
    if (!user) return res.status(404).json({ message: "User not found" });

    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "https://fitfinder.co";
    const html = `
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;line-height:1.6;">
  <div style="padding:24px 0;border-bottom:1px solid #e5e5e5;">
    <div style="display:inline-flex;align-items:center;gap:8px;">
      <div style="width:28px;height:28px;border-radius:6px;background:#3b82f6;color:white;font-weight:bold;font-size:16px;text-align:center;line-height:28px;">F</div>
      <span style="font-weight:600;font-size:16px;">Fit Finder</span>
    </div>
  </div>
  <div style="padding:32px 0;">
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;">Account Warning</h2>
    <p style="margin:0 0 16px;color:#4b5563;">Hi ${escapeHtml(user.name || "there")},</p>
    <p style="margin:0 0 16px;color:#4b5563;">Your account has received a warning from the Fit Finder moderation team.</p>
    <div style="background:#fef3c7;border:1px solid #fcd34d;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="color:#92400e;margin:0;font-weight:500;">${escapeHtml(reason.trim())}</p>
    </div>
    <p style="margin:0 0 16px;color:#4b5563;">Please review our <a href="${FRONTEND_URL}/legal/community-guidelines" style="color:#3b82f6;">Community Guidelines</a>. Repeated violations may result in account suspension.</p>
    <p style="margin:0;color:#6b7280;font-size:13px;">If you believe this is a mistake, reply to this email.</p>
  </div>
  <div style="padding:20px 0;border-top:1px solid #e5e5e5;font-size:12px;color:#6b7280;">
    <p style="margin:0;">You're receiving this because you have an account on Fit Finder.</p>
    <p style="margin:4px 0 0;">Questions? Contact support@fitfinder.co</p>
  </div>
</div>`;

    await sendEmail(user.email, "Fit Finder account warning", html);
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/admin/users/:id/warn]:", e);
    return res.status(500).json({ message: "Failed to send warning" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.session.userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    // Fetch avatar URL before deletion so we can clean up R2
    const userToDelete = await storage.getUser(id as string);
    const avatarUrl = userToDelete?.image;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Tokens
      await client.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [id]);
      await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [id]);
      // Messages & conversations — must delete messages before conversations (FK)
      await client.query(
        `DELETE FROM messages WHERE conversation_id IN (
           SELECT id FROM conversations WHERE client_id = $1 OR trainer_id = $1
         )`, [id]
      );
      await client.query(`DELETE FROM conversations WHERE client_id = $1 OR trainer_id = $1`, [id]);
      // Reviews before orders (FK: reviews.order_id → orders.id)
      await client.query(`DELETE FROM reviews WHERE reviewer_id = $1 OR trainer_id = $1`, [id]);
      // Plans — nullify FK on orders then delete plans
      await client.query(
        `UPDATE orders SET plan_id = NULL WHERE plan_id IN (SELECT id FROM plans WHERE trainer_id = $1)`,
        [id]
      );
      await client.query(`DELETE FROM plans WHERE trainer_id = $1`, [id]);
      // Orders (both sides)
      await client.query(`DELETE FROM orders WHERE buyer_id = $1 OR trainer_id = $1`, [id]);
      // Supporting tables
      await client.query(`DELETE FROM favorites WHERE user_id = $1 OR trainer_id = $1`, [id]);
      await client.query(`DELETE FROM blocks WHERE blocker_id = $1 OR blocked_id = $1`, [id]);
      await client.query(`DELETE FROM reports WHERE reporter_id = $1 OR reported_id = $1`, [id]);
      await client.query(`DELETE FROM legal_acceptances WHERE user_id = $1`, [id]);
      // Profiles
      await client.query(`DELETE FROM client_profiles WHERE user_id = $1`, [id]);
      await client.query(`DELETE FROM trainer_profiles WHERE user_id = $1`, [id]);
      await client.query(`DELETE FROM profiles WHERE user_id = $1`, [id]);
      // Sessions
      await client.query(`DELETE FROM session WHERE sess->>'userId' = $1`, [id]);
      await client.query(`DELETE FROM users WHERE id = $1`, [id]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // Clean up R2 avatar after DB deletion (best-effort)
    if (avatarUrl) {
      deleteImage(avatarUrl).catch((e) => console.error("[admin] Failed to delete avatar from R2:", e));
    }

    return res.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/admin/users/:id]:", e);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
