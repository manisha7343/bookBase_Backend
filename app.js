const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require("express");

require("dotenv").config();
const cors = require("cors");
const app = express();

//------------- imports Internal Moduels (Routes & Middllewraes & DB)--------------
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const adminBookRoutes = require("./routes/adminBookRoutes");
const userRoutes = require("./routes/userRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");
const adminBorrowingRoutes = require("./routes/adminBorrowingRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const { getSettings } = require("./controllers/adminDashboardController");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initOverdueCron } = require("./cron/overdueCron");

// ------------ DB connection --------------------
const connectDB = require("./config/db");
connectDB();

// ------------ Cron Jobs ------------------------
initOverdueCron();

// ------ middlwares ---------------
app.use(cors()); //CORS
app.use(express.json()); //JSON 
 
app.get("/", (req, res) => {
  res.json({
    message: "Library Management System API is running"
  });
});

//---------------- Routes ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin/books", adminBookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/admin/borrowings", adminBorrowingRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.get("/api/settings", getSettings);

//--------------- Error middleware ---------------
app.use(notFound);
app.use(errorHandler);

// ---------------- Server ---------------------
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});

module.exports = app;