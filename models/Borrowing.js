const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    borrowedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["BORROWED", "RETURNED", "OVERDUE"],
      default: "BORROWED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Borrowing", borrowingSchema);
