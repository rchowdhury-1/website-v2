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

// POST /billing/checkout
router.post("/checkout", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
  const user = result.rows[0];

  if (!user) return res.status(404).json({ error: "User not found" });

  const priceId = process.env.STRIPE_PRICE_ID;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      // userId passed in metadata so the webhook can look up who paid
      metadata: { userId },
      success_url: `${frontendUrl}/billing?success=1`,
      cancel_url: `${frontendUrl}/billing?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe session create failed", details: err.message });
  }
});

module.exports = router;
