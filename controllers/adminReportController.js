const Book = require("../models/Book");
const User = require("../models/User");
const Borrowing = require("../models/Borrowing");

// @desc    Get book inventory report & category breakdown
// @route   GET /api/admin/reports/books
// @access  Private (Admin only)
const getBookReports = async (req, res, next) => {
  try {
    const totalTitles = await Book.countDocuments();
    const outOfStockTitles = await Book.countDocuments({ availableQuantity: 0 });
    const lowStockBooks = await Book.find({ availableQuantity: { $gt: 0, $lte: 2 } })
      .select("title author category quantity availableQuantity isbn");

    // Group by category
    const categoryBreakdown = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          totalTitles: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          availableQuantity: { $sum: "$availableQuantity" }
        }
      },
      { $sort: { totalTitles: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalTitles,
        outOfStockTitles,
        lowStockBooks,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user demographics and activity report
// @route   GET /api/admin/reports/users
// @access  Private (Admin only)
const getUserReports = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", isBlocked: false });
    const blockedUsers = await User.countDocuments({ role: "user", isBlocked: true });

    // Group users by country
    const countryBreakdown = await User.aggregate([
      { $match: { role: "user" } },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent registered users
    const recentUsers = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        countryBreakdown,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrowing analytics report
// @route   GET /api/admin/reports/borrowings
// @access  Private (Admin only)
const getBorrowingReports = async (req, res, next) => {
  try {
    const totalBorrowings = await Borrowing.countDocuments();
    const currentlyBorrowed = await Borrowing.countDocuments({ status: "BORROWED" });
    const returnedCount = await Borrowing.countDocuments({ status: "RETURNED" });
    const overdueCount = await Borrowing.countDocuments({ status: "OVERDUE" });

    // Status breakdown
    const statusBreakdown = await Borrowing.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // All borrowing logs with user and book details
    const borrowings = await Borrowing.find()
      .populate("userId", "name email country")
      .populate("bookId", "title author category isbn")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        totalBorrowings,
        currentlyBorrowed,
        returnedCount,
        overdueCount,
        statusBreakdown,
        borrowings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed overdue books and defaulters report
// @route   GET /api/admin/reports/overdue
// @access  Private (Admin only)
const getOverdueReports = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const overdueBorrowings = await Borrowing.find({
      $or: [
        { status: "OVERDUE" },
        { status: "BORROWED", dueDate: { $lt: currentDate } }
      ]
    })
      .populate("userId", "name email country isBlocked")
      .populate("bookId", "title author isbn category")
      .sort({ dueDate: 1 });

    // Calculate days overdue for each record
    const formattedOverdue = overdueBorrowings.map((item) => {
      const due = new Date(item.dueDate);
      const diffTime = Math.max(0, currentDate - due);
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: item._id,
        user: item.userId,
        book: item.bookId,
        borrowedAt: item.borrowedAt,
        dueDate: item.dueDate,
        daysOverdue,
        status: item.status
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOverdue: formattedOverdue.length,
        overdueList: formattedOverdue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookReports,
  getUserReports,
  getBorrowingReports,
  getOverdueReports
};
