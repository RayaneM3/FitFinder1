import { Router } from "express";
import { requireAdmin } from "../middleware";
import { pool } from "../db";

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
    await pool.query(
      `UPDATE users SET "bannedAt" = now() WHERE id = $1`,
      [id]
    );
    // Invalidate all sessions for this user
    await pool.query(
      `DELETE FROM session WHERE sess::text LIKE $1`,
      [`%"userId":"${id}"%`]
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

export default router;
