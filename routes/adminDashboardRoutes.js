const express = require("express");
const {
  getDashboardStats,
  getReports,
  getSettings,
  updateSettings,
} = require("../controllers/adminDashboardController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// Library Settings (Public read for library info across the app)
router.get("/settings", getSettings);

router.use(verifyJWT, checkRole("admin"));

// Dashboard Statistics
router.get("/dashboard", getDashboardStats);

// Reports (supports ?type=books | users | borrowings | overdue)
router.get("/reports", getReports);

// Library Settings (Update - Admin only)
router.put("/settings", updateSettings);

module.exports = router;
