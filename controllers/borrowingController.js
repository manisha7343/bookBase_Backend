const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const Setting = require("../models/Setting");
const mongoose = require("mongoose");
const { checkAndMarkOverdueBooks } = require("../cron/overdueCron");

// 1. Borrow a Book
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required",
      });
    }

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check user blocked status
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. You cannot borrow books.",
      });
    }

    // Load library settings for max books and borrow duration
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    // Check active borrowings count for this user
    const activeBorrowingsCount = await Borrowing.countDocuments({
      userId: req.user._id,
      status: { $in: ["BORROWED", "OVERDUE"] },
    });

    if (activeBorrowingsCount >= settings.maxBooks) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum allowed limit of ${settings.maxBooks} borrowed books.`,
      });
    }

    // Check if user has already borrowed this specific book and not yet returned
    const alreadyBorrowed = await Borrowing.findOne({
      userId: req.user._id,
      bookId,
      status: { $in: ["BORROWED", "OVERDUE"] },
    });

    if (alreadyBorrowed) {
      return res.status(400).json({
        success: false,
        message: "You have already borrowed a copy of this book and have not returned it yet.",
      });
    }

    // Check book existence and availability
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "This book is currently out of stock / unavailable",
      });
    }

    // Calculate due date (default duration from settings or 14 days)
    const durationDays = settings.borrowDuration || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    // Decrease availableQuantity in one atomic step, so two people can't
    // borrow the last copy at the same moment
    const updatedBook = await Book.findOneAndUpdate(
      { _id: book._id, availableQuantity: { $gt: 0 } },
      { $inc: { availableQuantity: -1 } },
      { returnDocument: "after" }
    );

    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        message: "This book is currently out of stock / unavailable",
      });
    }

    // Create borrowing record (give the copy back if this fails)
    let borrowing;
    try {
      borrowing = await Borrowing.create({
        userId: req.user._id,
        bookId: book._id,
        borrowedAt: new Date(),
        dueDate,
        status: "BORROWED",
      });
    } catch (createError) {
      await Book.updateOne({ _id: book._id }, { $inc: { availableQuantity: 1 } });
      throw createError;
    }

    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate("bookId", "title author isbn category coverImage")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      borrowing: populatedBorrowing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Return a Book
const returnBook = async (req, res) => {
  try {
    const borrowingId = req.params.id;

    if (!mongoose.isValidObjectId(borrowingId)) {
      return res.status(404).json({
        success: false,
        message: "Borrowing record not found",
      });
    }

    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: "Borrowing record not found",
      });
    }

    // If user is not admin, verify ownership
    if (
      req.user.role !== "admin" &&
      borrowing.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to return this borrowing record",
      });
    }

    if (borrowing.status === "RETURNED") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned",
      });
    }

    // Set returned timestamp and update status
    borrowing.returnedAt = new Date();
    borrowing.status = "RETURNED";
    await borrowing.save();

    // Increase book available quantity
    const book = await Book.findById(borrowing.bookId);
    if (book) {
      book.availableQuantity += 1;
      // Safeguard in case availableQuantity exceeds total quantity
      if (book.availableQuantity > book.quantity) {
        book.availableQuantity = book.quantity;
      }
      await book.save();
    }

    const updatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate("bookId", "title author isbn category")
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      borrowing: updatedBorrowing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. User: Get Currently Borrowed Books (my-books)
const getMyBooks = async (req, res) => {
  try {
    // Make sure books past their due date show as OVERDUE right away
    await checkAndMarkOverdueBooks();

    const activeBorrowings = await Borrowing.find({
      userId: req.user._id,
      status: { $in: ["BORROWED", "OVERDUE"] },
    })
      .populate("bookId", "title author category isbn coverImage publicationInfo")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: activeBorrowings.length,
      borrowings: activeBorrowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. User: Get Borrowing History
const getMyHistory = async (req, res) => {
  try {
    await checkAndMarkOverdueBooks();

    const history = await Borrowing.find({
      userId: req.user._id,
    })
      .populate("bookId", "title author category isbn coverImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      borrowings: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Admin: Get Borrowings (all, overdue, returned, borrowed)
// Supports ?status=BORROWED|OVERDUE|RETURNED|ALL and ?userId=<id>
const findAdminBorrowings = async (res, status, userId) => {
  try {
    await checkAndMarkOverdueBooks();

    const filter = {};

    if (status && status.toUpperCase() !== "ALL") {
      filter.status = status.toUpperCase();
    }

    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }
      filter.userId = userId;
    }

    const borrowings = await Borrowing.find(filter)
      .populate("userId", "name email country role isBlocked")
      .populate("bookId", "title author isbn category quantity availableQuantity")
      .sort(status && status.toUpperCase() === "OVERDUE" ? { dueDate: 1 } : { createdAt: -1 });

    res.status(200).json({
      success: true,
      count: borrowings.length,
      borrowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminBorrowings = (req, res) =>
  findAdminBorrowings(res, req.query.status, req.query.userId);

// GET /api/admin/borrowings/overdue
const getOverdueBorrowings = (req, res) => findAdminBorrowings(res, "OVERDUE");

// GET /api/admin/borrowings/returned
const getReturnedBorrowings = (req, res) => findAdminBorrowings(res, "RETURNED");

module.exports = {
  borrowBook,
  returnBook,
  getMyBooks,
  getMyHistory,
  getAdminBorrowings,
  getOverdueBorrowings,
  getReturnedBorrowings,
};
