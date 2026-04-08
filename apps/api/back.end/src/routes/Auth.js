const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");

const { pool } = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId, refreshToken) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await pool.query(
    "INSERT INTO refresh_tokens (id, token, user_id, created_at) VALUES ($1, $2, $3, $4)",
    [id, refreshToken, userId, createdAt]
  );
}

const registerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await pool.query(
      "INSERT INTO users (id, name, email, password_hash, plan, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, name || null, email, passwordHash, "FREE", createdAt]
    );

    const { accessToken, refreshToken } = generateTokens(userId);
    await storeRefreshToken(userId, refreshToken);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res.json({ token: accessToken });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res.json({ token: accessToken });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // Check token exists in DB (wasn't logged out)
  const result = await pool.query(
    "SELECT id FROM refresh_tokens WHERE token = $1",
    [token]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Refresh token revoked" });
  }

  const accessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  return res.json({ token: accessToken });
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  }
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  return res.json({ success: true });
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const result = await pool.query(
    "SELECT id, name, email, plan, created_at FROM users WHERE id = $1",
    [userId]
  );
  return res.json(result.rows[0]);
});

module.exports = router;
