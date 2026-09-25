const express = require("express");
const {
  getAdminBorrowings,
  getOverdueBorrowings,
  getReturnedBorrowings,
  returnBook,
} = require("../controllers/borrowingController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT, checkRole("admin"));

// Get all borrowings with optional status filter (?status=OVERDUE / RETURNED / BORROWED)
router.get("/", getAdminBorrowings);

// Overdue and returned lists
router.get("/overdue", getOverdueBorrowings);
router.get("/returned", getReturnedBorrowings);

// Admin marks a book as returned (e.g. member returns it at the desk)
router.put("/:id/return", returnBook);

module.exports = router;
