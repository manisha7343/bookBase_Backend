const Book = require("../models/Book");
const User = require("../models/User");
const Borrowing = require("../models/Borrowing");
const Setting = require("../models/Setting");
const { checkAndMarkOverdueBooks } = require("../cron/overdueCron");

// 1. GET /api/admin/dashboard - Return stats
const getDashboardStats = async (req, res) => {
  try {
    await checkAndMarkOverdueBooks();

    const [
      totalBooks,
      totalUsers,
      borrowedBooks,
      returnedBooks,
      overdueBooks,
      availableAgg,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "user" }),
      Borrowing.countDocuments({ status: "BORROWED" }),
      Borrowing.countDocuments({ status: "RETURNED" }),
      Borrowing.countDocuments({ status: "OVERDUE" }),
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalAvailable: { $sum: "$availableQuantity" },
          },
        },
      ]),
    ]);

    const availableBooks =
      availableAgg.length > 0 ? availableAgg[0].totalAvailable : 0;

    // Lists shown on the dashboard: recent borrowings and overdue books
    const [recentBorrowings, overdueList] = await Promise.all([
      Borrowing.find({ status: { $in: ["BORROWED", "OVERDUE"] } })
        .populate("userId", "name email")
        .populate("bookId", "title author")
        .sort({ createdAt: -1 })
        .limit(5),
      Borrowing.find({ status: "OVERDUE" })
        .populate("userId", "name email")
        .populate("bookId", "title author")
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        availableBooks,
        totalUsers,
        borrowedBooks,
        returnedBooks,
        overdueBooks,
      },
      recentBorrowings,
      overdueList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. GET /api/admin/reports - Reports for books, users, borrowings, overdue
const getReports = async (req, res) => {
  try {
    await checkAndMarkOverdueBooks();

    // type can come from /reports/:type or /reports?type=
    const type = req.params.type || req.query.type;

    // Books Report
    if (type === "books") {
      const books = await Book.find().select(
        "title author category isbn quantity availableQuantity"
      );
      const categoryBreakdown = await Book.aggregate([
        {
          $group: {
            _id: "$category",
            totalBooks: { $sum: 1 },
            totalCopies: { $sum: "$quantity" },
            availableCopies: { $sum: "$availableQuantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return res.status(200).json({
        success: true,
        reportType: "books",
        categoryBreakdown,
        books,
      });
    }

    // Users Report
    if (type === "users") {
      const users = await User.find().select("-password");
      return res.status(200).json({
        success: true,
        reportType: "users",
        count: users.length,
        users,
      });
    }

    // Borrowings Report
    if (type === "borrowings") {
      const borrowings = await Borrowing.find()
        .populate("userId", "name email")
        .populate("bookId", "title author isbn category")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        reportType: "borrowings",
        count: borrowings.length,
        borrowings,
      });
    }

    // Overdue Report
    if (type === "overdue") {
      const overdueBorrowings = await Borrowing.find({ status: "OVERDUE" })
        .populate("userId", "name email country")
        .populate("bookId", "title author isbn")
        .sort({ dueDate: 1 });

      const overdueData = overdueBorrowings.map((b) => {
        const daysOverdue = Math.max(
          0,
          Math.floor((new Date() - new Date(b.dueDate)) / (1000 * 60 * 60 * 24))
        );
        return {
          borrowingId: b._id,
          user: b.userId,
          book: b.bookId,
          borrowedAt: b.borrowedAt,
          dueDate: b.dueDate,
          daysOverdue,
        };
      });

      return res.status(200).json({
        success: true,
        reportType: "overdue",
        count: overdueData.length,
        overdueBorrowings: overdueData,
      });
    }

    // Combined overview report if type is not specified or is "all"
    const [booksCount, usersCount, borrowingsCount, overdueCount] =
      await Promise.all([
        Book.countDocuments(),
        User.countDocuments(),
        Borrowing.countDocuments(),
        Borrowing.countDocuments({ status: "OVERDUE" }),
      ]);

    const recentBorrowings = await Borrowing.find()
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      reportType: "summary",
      summary: {
        totalBooks: booksCount,
        totalUsers: usersCount,
        totalBorrowings: borrowingsCount,
        overdueCount,
      },
      recentBorrowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. GET /api/admin/settings - Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. PUT /api/admin/settings - Update settings
const updateSettings = async (req, res) => {
  try {
    const { libraryName, maxBooks, borrowDuration, contactEmail, contactPhone, address } =
      req.body;

    if (libraryName !== undefined && !String(libraryName).trim()) {
      return res.status(400).json({ success: false, message: "Library name is required" });
    }
    if (maxBooks !== undefined && (!Number.isInteger(Number(maxBooks)) || Number(maxBooks) < 1)) {
      return res.status(400).json({ success: false, message: "Maximum books per user must be 1 or more" });
    }
    if (
      borrowDuration !== undefined &&
      (!Number.isInteger(Number(borrowDuration)) || Number(borrowDuration) < 1)
    ) {
      return res.status(400).json({ success: false, message: "Borrow duration must be 1 day or more" });
    }

    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting({});
    }

    if (libraryName !== undefined) settings.libraryName = String(libraryName).trim();
    if (maxBooks !== undefined) settings.maxBooks = Number(maxBooks);
    if (borrowDuration !== undefined)
      settings.borrowDuration = Number(borrowDuration);
    if (contactEmail !== undefined) settings.contactEmail = String(contactEmail).trim();
    if (contactPhone !== undefined) settings.contactPhone = String(contactPhone).trim();
    if (address !== undefined) settings.address = String(address).trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. GET /api/settings - Public library info (name, rules, contact)
// Used by the home page, forgot password page and borrowing screens.
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({
      success: true,
      settings: {
        libraryName: settings.libraryName,
        maxBooks: settings.maxBooks,
        borrowDuration: settings.borrowDuration,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getReports,
  getSettings,
  updateSettings,
  getPublicSettings,
};
