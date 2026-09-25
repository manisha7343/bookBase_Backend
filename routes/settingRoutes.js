const express = require("express");
const { getPublicSettings } = require("../controllers/adminDashboardController");

const router = express.Router();

// Public: library name, borrowing rules and contact details
router.get("/", getPublicSettings);

module.exports = router;
