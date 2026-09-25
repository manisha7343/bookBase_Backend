const express = require("express");
const {
  getBookReports,
  getUserReports,
  getBorrowingReports,
  getOverdueReports
} = require("../controllers/adminReportController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth & admin check to all report routes
router.use(verifyJWT, adminOnly);

router.get("/books", getBookReports);
router.get("/users", getUserReports);
router.get("/borrowings", getBorrowingReports);
router.get("/overdue", getOverdueReports);

module.exports = router;
