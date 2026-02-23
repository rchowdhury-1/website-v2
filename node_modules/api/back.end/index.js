require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const customersRoutes = require("./src/routes/customers");
const billingRoutes = require("./src/routes/billing");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SaaSify API (SQLite) running");
});

app.use("/auth", authRoutes);
app.use("/customers", customersRoutes);
app.use("/billing", billingRoutes);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});