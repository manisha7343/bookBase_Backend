const express = require("express");

const {
  getBooks,
  getBookById,
  searchBooks,
} = require("../controllers/bookController");

const router = express.Router();

// Search books
router.get("/search", searchBooks);

// Get all books
router.get("/", getBooks);

// Get single book
router.get("/:id", getBookById);

module.exports = router;