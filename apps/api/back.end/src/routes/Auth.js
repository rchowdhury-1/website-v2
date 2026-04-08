const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");

const { pool } = require("../db");
const requireAuth = require("../middleware/requireAuth");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../email");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
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

async function createAndSendVerificationToken(userId, email) {
  const token = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  // Remove any existing token for this user first
  await pool.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [userId]);

  await pool.query(
    "INSERT INTO email_verification_tokens (id, token, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, token, userId, expiresAt, createdAt]
  );

  await sendVerificationEmail(email, token);
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
      "INSERT INTO users (id, name, email, password_hash, plan, email_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [userId, name || null, email, passwordHash, "FREE", false, createdAt]
    );

    // Send verification email — don't block registration if email fails
    try {
      await createAndSendVerificationToken(userId, email);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
    }

    return res.status(201).json({
      message: "Account created. Please check your email to verify your account before logging in.",
    });
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

    const result = await pool.query(
      "SELECT id, password_hash, email_verified FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.email_verified) {
      return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
    }

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

// GET /auth/verify-email?token=xxx
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect(`${FRONTEND_URL}/login?error=missing_token`);

  const result = await pool.query(
    "SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1",
    [token]
  );
  const row = result.rows[0];

  if (!row) return res.redirect(`${FRONTEND_URL}/login?error=invalid_token`);
  if (new Date(row.expires_at) < new Date()) {
    await pool.query("DELETE FROM email_verification_tokens WHERE token = $1", [token]);
    return res.redirect(`${FRONTEND_URL}/login?error=token_expired`);
  }

  await pool.query("UPDATE users SET email_verified = true WHERE id = $1", [row.user_id]);
  await pool.query("DELETE FROM email_verification_tokens WHERE token = $1", [token]);

  return res.redirect(`${FRONTEND_URL}/login?verified=true`);
});

// POST /auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });

  const result = await pool.query(
    "SELECT id, email_verified FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  // Always return success to avoid leaking whether an email exists
  if (!user || user.email_verified) {
    return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
  }

  try {
    await createAndSendVerificationToken(user.id, email);
  } catch (err) {
    console.error("Failed to resend verification email:", err.message);
  }

  return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
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

  const result = await pool.query("SELECT id FROM refresh_tokens WHERE token = $1", [token]);
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

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  // Always return success — never reveal whether an email exists
  const successMsg = { message: "If that email is registered, a reset link has been sent." };

  if (!email) return res.json(successMsg);

  const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) return res.json(successMsg);

  const token = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  const createdAt = new Date().toISOString();

  // Remove existing reset tokens for this user
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id]);

  await pool.query(
    "INSERT INTO password_reset_tokens (id, token, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, token, user.id, expiresAt, createdAt]
  );

  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
  }

  return res.json(successMsg);
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: "Token and password (min 8 chars) are required" });
  }

  const result = await pool.query(
    "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
    [token]
  );
  const row = result.rows[0];

  if (!row) return res.status(400).json({ error: "Invalid or expired reset token" });
  if (new Date(row.expires_at) < new Date()) {
    await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
    return res.status(400).json({ error: "Reset token has expired" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, row.user_id]);
  await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);

  return res.json({ message: "Password reset successfully. You can now log in." });
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
