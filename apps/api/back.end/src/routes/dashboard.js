const express = require("express");
const { pool } = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// GET /dashboard/stats
router.get("/stats", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const now = new Date();

  // First day of current month (ISO string)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 6 months ago from start of current month
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const [userResult, totalResult, thisMonthResult, monthlyResult] = await Promise.all([
    pool.query("SELECT plan, created_at FROM users WHERE id = $1", [userId]),
    pool.query("SELECT COUNT(*) AS total FROM customers WHERE user_id = $1", [userId]),
    pool.query(
      "SELECT COUNT(*) AS count FROM customers WHERE user_id = $1 AND created_at >= $2",
      [userId, firstOfMonth]
    ),
    pool.query(
      `SELECT SUBSTRING(created_at, 1, 7) AS month, COUNT(*) AS count
       FROM customers
       WHERE user_id = $1 AND created_at >= $2
       GROUP BY month
       ORDER BY month ASC`,
      [userId, sixMonthsAgo]
    ),
  ]);

  const user = userResult.rows[0];

  // Build a full 6-month array, filling in 0 for months with no customers
  const monthlyMap = {};
  for (const row of monthlyResult.rows) {
    monthlyMap[row.month] = parseInt(row.count, 10);
  }

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    monthlyData.push({ month: label, customers: monthlyMap[key] || 0 });
  }

  return res.json({
    plan: user.plan,
    memberSince: user.created_at,
    totalCustomers: parseInt(totalResult.rows[0].total, 10),
    customersThisMonth: parseInt(thisMonthResult.rows[0].count, 10),
    monthlyData,
  });
});

module.exports = router;
