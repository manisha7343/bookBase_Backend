const dns = require('dns');
require("dotenv").config();

// Some networks can't resolve MongoDB Atlas SRV records with the default DNS,
// so we use public DNS servers. Set CUSTOM_DNS=false in .env to turn this off.
if (process.env.CUSTOM_DNS !== "false") {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const express = require("express");
const cors = require("cors");
const app = express();

// ------------- Required environment variables --------------
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("JWT_SECRET must be set in production.");
    process.exit(1);
  }
  console.warn("JWT_SECRET is not set - using a development-only secret.");
  process.env.JWT_SECRET = "bookbase_dev_only_secret";
}

//------------- imports Internal Moduels (Routes & Middllewraes & DB)--------------
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const adminBookRoutes = require("./routes/adminBookRoutes");
const userRoutes = require("./routes/userRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");
const adminBorrowingRoutes = require("./routes/adminBorrowingRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const settingRoutes = require("./routes/settingRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initOverdueCron } = require("./cron/overdueCron");

// ------------ DB connection --------------------
const connectDB = require("./config/db");
connectDB();

// ------------ Cron Jobs ------------------------
initOverdueCron();

// ------ middlwares ---------------
// CLIENT_URL can hold one or more comma-separated frontend URLs.
// If it is not set, every origin is allowed (handy during development).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
); //CORS
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
app.use("/api/settings", settingRoutes);

//--------------- Error middleware ---------------
app.use(notFound);
app.use(errorHandler);

// ---------------- Server ---------------------
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});

module.exports = app;
