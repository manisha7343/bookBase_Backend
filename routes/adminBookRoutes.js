const express = require("express");
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT, checkRole("admin"));

// Create book
router.post("/", createBook);

// Get all books
router.get("/", getBooks);

// Get single book
router.get("/:id", getBookById);

// Update book
router.put("/:id", updateBook);

// Delete book
router.delete("/:id", deleteBook);

module.exports = router;