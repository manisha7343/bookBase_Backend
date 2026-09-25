//---------- MANISHA SHARMA 341 -------------------

const express = require("express");

const {
  getBooks,
  getBookById,
  searchBooks,
} = require("../controllers/bookController");

const { verifyJWT } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyJWT); // ab sab routes login-protected honge

// Search books
router.get("/search", searchBooks);

// Get all books
router.get("/", getBooks);

// Get single book
router.get("/:id", getBookById);

module.exports = router;