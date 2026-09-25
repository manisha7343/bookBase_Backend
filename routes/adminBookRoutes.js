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

const upload = require("../middleware/upload");

const router = express.Router();

router.use(verifyJWT, checkRole("admin"));

// Dono files (coverImage + bookFile) ek saath handle karne ke liye
const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "bookFile", maxCount: 1 },
]);

// Create book
router.post("/", uploadFields, createBook);

// Get all books
router.get("/", getBooks);

// Get single book
router.get("/:id", getBookById);

// Update book
router.put("/:id", uploadFields, updateBook);

// Delete book
router.delete("/:id", deleteBook);

module.exports = router;