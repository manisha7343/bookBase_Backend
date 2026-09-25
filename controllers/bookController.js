// ------------- MS------------
const Book = require("../models/Book");
const cloudinary = require("../config/cloudinary");

// Helper: extract Cloudinary public_id from a stored file URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const publicId = fileName.split(".")[0];
  return `${folder}/${publicId}`;
};

// ================= CREATE BOOK =================

const createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };

    if (req.files?.coverImage?.[0]) {
      bookData.coverImage = req.files.coverImage[0].path;
    }
    if (req.files?.bookFile?.[0]) {
      bookData.bookFile = req.files.bookFile[0].path;
    }

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
    res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET BOOK BY ID =================

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE BOOK =================

const updateBook = async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const updateData = { ...req.body };

    if (req.files?.coverImage?.[0]) {
      if (existingBook.coverImage) {
        const publicId = getPublicIdFromUrl(existingBook.coverImage);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
      updateData.coverImage = req.files.coverImage[0].path;
    }

    if (req.files?.bookFile?.[0]) {
      if (existingBook.bookFile) {
        const publicId = getPublicIdFromUrl(existingBook.bookFile);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
      updateData.bookFile = req.files.bookFile[0].path;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE BOOK =================

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.coverImage) {
      const publicId = getPublicIdFromUrl(book.coverImage);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
    if (book.bookFile) {
      const publicId = getPublicIdFromUrl(book.bookFile);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    }

    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEARCH BOOKS =================

const searchBooks = async (req, res) => {
  try {
    const { title, author, category } = req.query;
    const conditions = [];

    if (title && title.trim()) conditions.push({ title: { $regex: title.trim(), $options: "i" } });
    if (author && author.trim()) conditions.push({ author: { $regex: author.trim(), $options: "i" } });
    if (category && category.trim()) conditions.push({ category: { $regex: category.trim(), $options: "i" } });

    const query = conditions.length > 0 ? { $or: conditions } : {};
    const books = await Book.find(query);

    res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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