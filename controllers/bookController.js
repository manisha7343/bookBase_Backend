// ------------- MS------------
const mongoose = require("mongoose");
const Book = require("../models/Book");
const Borrowing = require("../models/Borrowing");

// Escape special characters so user input like "C++" is searched literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Sends a proper status code for validation / duplicate ISBN errors
const sendBookError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A book with this ISBN already exists",
    });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: error.message,
  });
};

// Basic book validation used by create and update
const validateBook = (data, isUpdate = false) => {
  const required = ["title", "author", "category", "isbn"];
  for (const field of required) {
    if (!isUpdate || data[field] !== undefined) {
      if (!data[field] || !String(data[field]).trim()) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
  }

  if (!isUpdate || data.quantity !== undefined) {
    const quantity = Number(data.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return "Quantity must be a whole number (0 or more)";
    }
  }

  return null;
};

// ================= CREATE BOOK =================

const createBook = async (req, res) => {
  try {
    const validationError = validateBook(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const bookData = { ...req.body };
    bookData.quantity = Number(bookData.quantity);
    if (bookData.availableQuantity === undefined && bookData.quantity !== undefined) {
      bookData.availableQuantity = bookData.quantity;
    }
    // available copies can never be more than total copies
    bookData.availableQuantity = Math.min(
      Number(bookData.availableQuantity),
      bookData.quantity
    );

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    sendBookError(res, error);
  }
};

// ================= GET ALL BOOKS =================
// Optional: ?category=Fiction to filter by category

const getBooks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category.trim()) {
      filter.category = {
        $regex: `^${escapeRegex(req.query.category.trim())}$`,
        $options: "i",
      };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET BOOK BY ID =================

const getBookById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE BOOK =================

const updateBook = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const validationError = validateBook(req.body, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // availableQuantity is managed by borrow/return, so it is not taken from the form
    const updates = { ...req.body };
    delete updates.availableQuantity;
    delete updates._id;

    // When the total quantity changes, shift the available copies by the same amount
    if (updates.quantity !== undefined) {
      const newQuantity = Number(updates.quantity);
      const borrowedCopies = book.quantity - book.availableQuantity;

      if (newQuantity < borrowedCopies) {
        return res.status(400).json({
          success: false,
          message: `Quantity cannot be less than ${borrowedCopies}, the number of copies currently borrowed`,
        });
      }

      updates.quantity = newQuantity;
      book.availableQuantity = newQuantity - borrowedCopies;
    }

    book.set(updates);
    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    sendBookError(res, error);
  }
};

// ================= DELETE BOOK =================

const deleteBook = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // A book that is still with a member cannot be removed
    const activeBorrowings = await Borrowing.countDocuments({
      bookId: req.params.id,
      status: { $in: ["BORROWED", "OVERDUE"] },
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        success: false,
        message: "This book is currently borrowed. It can be deleted after all copies are returned.",
      });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEARCH BOOKS =================

const searchBooks = async (req, res) => {
  try {
    const { title, author, category } = req.query;
    const conditions = [];

    if (title && title.trim()) {
      conditions.push({ title: { $regex: escapeRegex(title.trim()), $options: "i" } });
    }
    if (author && author.trim()) {
      conditions.push({ author: { $regex: escapeRegex(author.trim()), $options: "i" } });
    }
    if (category && category.trim()) {
      conditions.push({ category: { $regex: escapeRegex(category.trim()), $options: "i" } });
    }

    const query = conditions.length > 0 ? { $or: conditions } : {};
    const books = await Book.find(query).sort({ title: 1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  searchBooks,
  deleteBook,
};
