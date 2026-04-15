require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { initDb } = require("./src/db");
const authRoutes = require("./src/routes/Auth");
const customersRoutes = require("./src/routes/customers");
const billingRoutes = require("./src/routes/billing");
const webhookRouter = require("./src/routes/webhook");
const dashboardRoutes = require("./src/routes/dashboard");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true, // required for cookies to be sent cross-origin
  })
);

// Webhook must receive raw body BEFORE express.json() for signature verification
app.use("/billing/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/", (req, res) => res.send("SaaSify API running"));

app.use("/auth", authRoutes);
app.use("/customers", customersRoutes);
app.use("/billing", billingRoutes);
app.use("/dashboard", dashboardRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
