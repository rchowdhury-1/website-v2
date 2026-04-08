const express = require("express");
const crypto = require("crypto");

const { pool } = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    "SELECT id, name, email, company, created_at FROM customers WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  res.json(result.rows);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { name, email, company } = req.body || {};

  if (!name) return res.status(400).json({ error: "Customer name is required" });

  const userResult = await pool.query("SELECT plan FROM users WHERE id = $1", [userId]);
  const plan = userResult.rows[0]?.plan || "FREE";

  if (plan !== "PRO") {
    const countResult = await pool.query(
      "SELECT COUNT(*) as cnt FROM customers WHERE user_id = $1",
      [userId]
    );
    if (parseInt(countResult.rows[0].cnt, 10) >= 3) {
      return res.status(403).json({ error: "Free plan limit reached (3 customers). Upgrade to Pro." });
    }
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await pool.query(
    "INSERT INTO customers (id, user_id, name, email, company, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, userId, name, email || null, company || null, createdAt]
  );

  res.status(201).json({
    id,
    name,
    email: email || null,
    company: company || null,
    created_at: createdAt,
  });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM customers WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

  if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });

  res.json({ success: true });
});

module.exports = router;
