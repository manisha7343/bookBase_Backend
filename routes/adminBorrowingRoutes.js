const express = require("express");
const { getAdminBorrowings } = require("../controllers/borrowingController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT, checkRole("admin"));

// Get all borrowings with optional status filter (?status=OVERDUE / RETURNED / BORROWED)
router.get("/", getAdminBorrowings);

module.exports = router;
