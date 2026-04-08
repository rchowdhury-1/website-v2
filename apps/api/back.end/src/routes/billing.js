const express = require("express");
const stripeLib = require("stripe");

const { pool } = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return stripeLib(process.env.STRIPE_SECRET_KEY);
}

router.post("/checkout", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
  const user = result.rows[0];

  if (!user) return res.status(404).json({ error: "User not found" });

  const priceId = process.env.STRIPE_PRICE_ID;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  console.log("Stripe checkout attempt:", {
    email: user.email,
    priceId,
    frontendUrl,
    hasKey: !!process.env.STRIPE_SECRET_KEY,
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${frontendUrl}/billing?success=1`,
      cancel_url: `${frontendUrl}/billing?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe session create failed", details: err.message });
  }
});

router.post("/upgrade", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  await pool.query("UPDATE users SET plan = 'PRO' WHERE id = $1", [userId]);

  const result = await pool.query(
    "SELECT id, name, email, plan, created_at FROM users WHERE id = $1",
    [userId]
  );

  res.json({ success: true, user: result.rows[0] });
});

module.exports = router;
