const express = require("express");
const stripeLib = require("stripe");

const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);

// POST /billing/checkout
router.post("/checkout", requireAuth, (req, res) => {
  const userId = req.user.userId;

  const user = db
    .prepare("SELECT email FROM users WHERE id = ?")
    .get(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // TEMP LOGS TO DEBUG
  console.log("Stripe checkout attempt:", {
    email: user.email,
    priceId,
    frontendUrl,
    hasKey: !!process.env.STRIPE_SECRET_KEY,
  });

  stripe.checkout.sessions
    .create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${frontendUrl}/billing?success=1`,
      cancel_url: `${frontendUrl}/billing?canceled=1`,
    })
    .then((session) => {
      res.json({ url: session.url });
    })
    .catch((err) => {
      console.error("Stripe error:", err);
      // IMPORTANT: send actual message so we see what's wrong
      res.status(500).json({
        error: "Stripe session create failed",
        details: err.message,
      });
    });
});

// POST /billing/upgrade
router.post("/upgrade", requireAuth, (req, res) => {
  const userId = req.user.userId;

  db.prepare("UPDATE users SET plan = 'PRO' WHERE id = ?").run(userId);

  const user = db
    .prepare("SELECT id, name, email, plan, created_at FROM users WHERE id = ?")
    .get(userId);

  res.json({ success: true, user });
});

module.exports = router;