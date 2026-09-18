const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();

//------------- imports Internal Moduels (Routes & Middllewraes & DB)--------------
// const authRoutes = require("./routes/authRoutes");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const bookRoutes = require("./routes/bookRoutes");
const adminBookRoutes = require("./routes/adminBookRoutes");

// ------------ DB connection --------------------
const connectDB = require("./config/db");
connectDB();


// ------ middlwares ---------------
app.use(cors()); //CORS
app.use(express.json()); //JSON 
 
app.get("/", (req, res) => {
  res.json({
    message: "Library Management System API is running"
  });
});

//---------------- Routes ---------------------
// app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin/books", adminBookRoutes);



//--------------- Error middleware ---------------
// app.use(notFound);
// app.use(errorHandler);

// ---------------- Server ---------------------
const PORT = 3000; 
app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});

module.exports = app;