require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import routes
const accountCategoryRoutes = require("./routes/accountCategoryRoutes");
const accountRoutes = require("./routes/accountRoutes");
const accountTypeRoutes = require("./routes/accountTypeRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const bankAccountRoutes = require("./routes/bankAccountRoutes");
const creditCardRoutes = require("./routes/creditCardRoutes");
const journalEntryRoutes = require("./routes/journalEntryRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));
app.use(helmet());

// Basic rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
}));

// API routes
app.use("/api/accounting", accountingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/account-types", accountTypeRoutes);
app.use("/api/account-categories", accountCategoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/journal-entries", journalEntryRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/credit-cards", creditCardRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
