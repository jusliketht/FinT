const express = require("express");
const router = express.Router();

// Import route modules
const accountingRoutes = require("./accountingRoutes");
const reportRoutes = require("./reportRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API Routes
router.use("/accounting", accountingRoutes);
router.use("/reports", reportRoutes);

// Error handling for invalid routes
router.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
