require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { initDb } = require("./src/db");
const authRoutes = require("./src/routes/Auth");
const customersRoutes = require("./src/routes/customers");
const billingRoutes = require("./src/routes/billing");
const webhookRouter = require("./src/routes/webhook");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Webhook must be registered with raw body BEFORE express.json()
// Stripe needs the raw request body to verify the signature
app.use("/billing/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/", (req, res) => res.send("SaaSify API running"));

app.use("/auth", authRoutes);
app.use("/customers", customersRoutes);
app.use("/billing", billingRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
