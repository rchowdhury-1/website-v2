const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");

const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(userId, name || null, email, passwordHash, "FREE", createdAt);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  const userId = req.user.userId;

  const user = db
    .prepare("SELECT id, name, email, plan, created_at FROM users WHERE id = ?")
    .get(userId);

  return res.json(user);
});

module.exports = router;
