// ------------- MS------------
const Book = require("../models/Book");

// ================= CREATE BOOK =================

const createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    if (bookData.availableQuantity === undefined && bookData.quantity !== undefined) {
      bookData.availableQuantity = bookData.quantity;
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL BOOKS =================

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

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
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE BOOK =================

const deleteBook = async (req, res) => {
  try {
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
      conditions.push({ title: { $regex: title.trim(), $options: "i" } });
    }
    if (author && author.trim()) {
      conditions.push({ author: { $regex: author.trim(), $options: "i" } });
    }
    if (category && category.trim()) {
      conditions.push({ category: { $regex: category.trim(), $options: "i" } });
    }

    const query = conditions.length > 0 ? { $or: conditions } : {};
    const books = await Book.find(query);

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