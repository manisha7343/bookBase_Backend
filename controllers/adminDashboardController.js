const Book = require("../models/Book");
const User = require("../models/User");
const Borrowing = require("../models/Borrowing");

// @desc    Get Admin Dashboard statistics and analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Calculate Book metrics
    const bookAggregation = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$quantity" },
          availableStock: { $sum: "$availableQuantity" },
          uniqueTitles: { $sum: 1 }
        }
      }
    ]);

    const totalBooks = bookAggregation[0]?.totalStock || 0;
    const availableBooks = bookAggregation[0]?.availableStock || 0;
    const uniqueBookTitles = bookAggregation[0]?.uniqueTitles || 0;

    // 2. Calculate User metrics
    const totalUsers = await User.countDocuments({ role: "user" });
    const blockedUsers = await User.countDocuments({ role: "user", isBlocked: true });

    // 3. Calculate Borrowing metrics
    const currentDate = new Date();

    const [borrowedBooks, returnedBooks, overdueBooks] = await Promise.all([
      Borrowing.countDocuments({ status: "BORROWED" }),
      Borrowing.countDocuments({ status: "RETURNED" }),
      Borrowing.countDocuments({
        $or: [
          { status: "OVERDUE" },
          { status: "BORROWED", dueDate: { $lt: currentDate } }
        ]
      })
    ]);

    // 4. Fetch recent borrowings for frontend dashboard preview table
    const recentBorrowings = await Borrowing.find()
      .populate("userId", "name email")
      .populate("bookId", "title author coverImage")
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Fetch recent overdue borrowings for dashboard alert table
    const overdueList = await Borrowing.find({
      $or: [
        { status: "OVERDUE" },
        { status: "BORROWED", dueDate: { $lt: currentDate } }
      ]
    })
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .sort({ dueDate: 1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalBooks,
        availableBooks,
        uniqueBookTitles,
        totalUsers,
        blockedUsers,
        borrowedBooks,
        returnedBooks,
        overdueBooks,
        recentBorrowings,
        recentOverdue: overdueList
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
