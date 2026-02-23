const express = require("express");
const crypto = require("crypto");

const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const userId = req.user.userId;

  const rows = db
    .prepare(
      "SELECT id, name, email, company, created_at FROM customers WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(userId);

  res.json(rows);
});

router.post("/", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const { name, email, company } = req.body || {};

  if (!name) return res.status(400).json({ error: "Customer name is required" });

  // Check user plan
  const user = db.prepare("SELECT plan FROM users WHERE id = ?").get(userId);
  const plan = user?.plan || "FREE";

  if (plan !== "PRO") {
    const count = db
      .prepare("SELECT COUNT(*) as cnt FROM customers WHERE user_id = ?")
      .get(userId).cnt;

    if (count >= 3) {
      return res.status(403).json({ error: "Free plan limit reached (3 customers). Upgrade to Pro." });
    }
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO customers (id, user_id, name, email, company, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, userId, name, email || null, company || null, createdAt);

  res.status(201).json({
    id,
    name,
    email: email || null,
    company: company || null,
    created_at: createdAt,
  });
});

router.delete("/:id", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const result = db.prepare("DELETE FROM customers WHERE id = ? AND user_id = ?").run(id, userId);

  if (result.changes === 0) return res.status(404).json({ error: "Not found" });

  res.json({ success: true });
});

module.exports = router;
