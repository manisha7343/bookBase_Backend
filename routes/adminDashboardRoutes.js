const express = require("express");
const { getDashboardStats } = require("../controllers/adminDashboardController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth & admin check to all dashboard routes
router.use(verifyJWT, adminOnly);

router.get("/", getDashboardStats);

module.exports = router;
