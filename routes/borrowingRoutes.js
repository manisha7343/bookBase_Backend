const express = require("express");
const {
  borrowBook,
  returnBook,
  getMyBooks,
  getMyHistory,
} = require("../controllers/borrowingController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT);

// Borrow a book
router.post("/borrow", checkRole("user"), borrowBook);

// Return a book
router.put("/:id/return", returnBook);

// Get current borrowed books for the logged-in user
router.get("/my-books", getMyBooks);

// Get borrow history for the logged-in user
router.get("/history", getMyHistory);

module.exports = router;
