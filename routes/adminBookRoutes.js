const express = require("express");
// ADMIN 
// create | getBooks | BookById | update | delete
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const router = express.Router();

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