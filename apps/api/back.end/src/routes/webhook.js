const express = require("express");
const stripeLib = require("stripe");
const { pool } = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event;
  try {
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("No userId in session metadata");
      return res.status(400).json({ error: "Missing userId in metadata" });
    }

    try {
      await pool.query("UPDATE users SET plan = 'PRO' WHERE id = $1", [userId]);
      console.log(`User ${userId} upgraded to PRO via Stripe webhook`);
    } catch (err) {
      console.error("Failed to upgrade user plan:", err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  res.json({ received: true });
});

module.exports = router;
