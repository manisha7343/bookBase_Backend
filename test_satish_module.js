// Verification script to test Satish's Admin Dashboard, Reports & Settings controllers
const { getDashboardStats } = require("./controllers/adminDashboardController");
const {
  getBookReports,
  getUserReports,
  getBorrowingReports,
  getOverdueReports
} = require("./controllers/adminReportController");
const { getSettings, updateSettings } = require("./controllers/settingController");

const Book = require("./models/Book");
const User = require("./models/User");
const Borrowing = require("./models/Borrowing");
const Setting = require("./models/Setting");

// Mock response object
const createMockRes = () => {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
};

// Mock next handler
const mockNext = (err) => {
  if (err) console.error("Error passed to next():", err);
};

async function runTests() {
  console.log("==================================================");
  console.log(" 🧪 TESTING SATISH'S ADMIN CONTROLLERS & LOGIC");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  // Test 1: getDashboardStats structure
  total++;
  try {
    // Stub methods on models
    Book.aggregate = async () => [{ totalStock: 100, availableStock: 80, uniqueTitles: 20 }];
    User.countDocuments = async (query) => (query?.isBlocked ? 2 : 50);
    Borrowing.countDocuments = async (query) => {
      if (query?.status === "BORROWED") return 20;
      if (query?.status === "RETURNED") return 30;
      return 5; // overdue
    };
    Borrowing.find = () => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            limit: async () => [
              {
                _id: "mock_borrow_id_1",
                userId: { name: "Amay", email: "amay@test.com" },
                bookId: { title: "JavaScript Guide" },
                dueDate: new Date(),
                status: "BORROWED"
              }
            ]
          })
        })
      })
    });

    const res = createMockRes();
    await getDashboardStats({ user: { role: "admin" } }, res, mockNext);

    if (
      res.statusCode === 200 &&
      res.jsonData.success === true &&
      res.jsonData.data.totalBooks === 100 &&
      res.jsonData.data.availableBooks === 80 &&
      res.jsonData.data.totalUsers === 50 &&
      res.jsonData.data.borrowedBooks === 20 &&
      res.jsonData.data.returnedBooks === 30 &&
      res.jsonData.data.overdueBooks === 5
    ) {
      console.log(" [PASS] 1. GET /api/admin/dashboard stats controller");
      passed++;
    } else {
      console.error(" [FAIL] 1. GET /api/admin/dashboard returned unexpected data:", res.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 1 failed with exception:", err);
  }

  // Test 2: getBookReports
  total++;
  try {
    Book.countDocuments = async (q) => (q?.availableQuantity === 0 ? 3 : 25);
    Book.find = () => ({
      select: async () => [{ title: "Algorithms", availableQuantity: 1 }]
    });
    Book.aggregate = async () => [
      { _id: "Programming", totalTitles: 10, totalQuantity: 50, availableQuantity: 40 }
    ];

    const res = createMockRes();
    await getBookReports({ user: { role: "admin" } }, res, mockNext);

    if (
      res.statusCode === 200 &&
      res.jsonData.data.totalTitles === 25 &&
      res.jsonData.data.outOfStockTitles === 3 &&
      res.jsonData.data.categoryBreakdown.length > 0
    ) {
      console.log(" [PASS] 2. GET /api/admin/reports/books controller");
      passed++;
    } else {
      console.error(" [FAIL] 2. GET /api/admin/reports/books unexpected output:", res.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 2 failed with exception:", err);
  }

  // Test 3: getUserReports
  total++;
  try {
    User.countDocuments = async (q) => (q?.isBlocked ? 4 : 46);
    User.aggregate = async () => [{ _id: "India", count: 40 }];
    User.find = () => ({
      select: () => ({
        sort: () => ({
          limit: async () => [{ name: "Test User", email: "test@user.com" }]
        })
      })
    });

    const res = createMockRes();
    await getUserReports({ user: { role: "admin" } }, res, mockNext);

    if (
      res.statusCode === 200 &&
      res.jsonData.data.totalUsers === 46 &&
      res.jsonData.data.blockedUsers === 4 &&
      res.jsonData.data.countryBreakdown[0]._id === "India"
    ) {
      console.log(" [PASS] 3. GET /api/admin/reports/users controller");
      passed++;
    } else {
      console.error(" [FAIL] 3. GET /api/admin/reports/users unexpected output:", res.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 3 failed with exception:", err);
  }

  // Test 4: getBorrowingReports
  total++;
  try {
    Borrowing.countDocuments = async (q) => {
      if (q?.status === "BORROWED") return 15;
      if (q?.status === "RETURNED") return 25;
      if (q?.status === "OVERDUE") return 5;
      return 45; // total
    };
    Borrowing.aggregate = async () => [
      { _id: "BORROWED", count: 15 },
      { _id: "RETURNED", count: 25 }
    ];
    Borrowing.find = () => ({
      populate: () => ({
        populate: () => ({
          sort: async () => [
            { _id: "b1", status: "BORROWED", userId: { name: "John" }, bookId: { title: "React" } }
          ]
        })
      })
    });

    const res = createMockRes();
    await getBorrowingReports({ user: { role: "admin" } }, res, mockNext);

    if (
      res.statusCode === 200 &&
      res.jsonData.data.totalBorrowings === 45 &&
      res.jsonData.data.currentlyBorrowed === 15 &&
      res.jsonData.data.returnedCount === 25
    ) {
      console.log(" [PASS] 4. GET /api/admin/reports/borrowings controller");
      passed++;
    } else {
      console.error(" [FAIL] 4. GET /api/admin/reports/borrowings unexpected output:", res.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 4 failed with exception:", err);
  }

  // Test 5: getOverdueReports
  total++;
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    Borrowing.find = () => ({
      populate: () => ({
        populate: () => ({
          sort: async () => [
            {
              _id: "overdue_1",
              userId: { name: "Late Borrower", email: "late@user.com" },
              bookId: { title: "C++ Basics" },
              dueDate: pastDate,
              borrowedAt: pastDate,
              status: "OVERDUE"
            }
          ]
        })
      })
    });

    const res = createMockRes();
    await getOverdueReports({ user: { role: "admin" } }, res, mockNext);

    if (
      res.statusCode === 200 &&
      res.jsonData.data.totalOverdue === 1 &&
      res.jsonData.data.overdueList[0].daysOverdue >= 5
    ) {
      console.log(" [PASS] 5. GET /api/admin/reports/overdue controller (daysOverdue calculation correct)");
      passed++;
    } else {
      console.error(" [FAIL] 5. GET /api/admin/reports/overdue unexpected output:", res.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 5 failed with exception:", err);
  }

  // Test 6: Settings controller
  total++;
  try {
    const mockSettingDoc = {
      libraryName: "BookBase Central Library",
      maxBooksPerUser: 5,
      borrowDuration: 14,
      save: async function () {
        return this;
      }
    };

    Setting.findOne = async () => mockSettingDoc;

    const resGet = createMockRes();
    await getSettings({}, resGet, mockNext);

    const resPut = createMockRes();
    await updateSettings(
      {
        body: {
          libraryName: "Updated University Library",
          maxBooksPerUser: 8
        }
      },
      resPut,
      mockNext
    );

    if (
      resGet.statusCode === 200 &&
      resPut.statusCode === 200 &&
      resPut.jsonData.data.libraryName === "Updated University Library" &&
      resPut.jsonData.data.maxBooksPerUser === 8
    ) {
      console.log(" [PASS] 6. GET & PUT /api/admin/settings controller");
      passed++;
    } else {
      console.error(" [FAIL] 6. Settings controller unexpected output:", resPut.jsonData);
    }
  } catch (err) {
    console.error(" [ERROR] Test 6 failed with exception:", err);
  }

  console.log("==================================================");
  console.log(` 🏁 RESULT: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
