const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
    },
    borrowedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["BORROWED", "RETURNED", "OVERDUE"],
      default: "BORROWED",
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for querying active borrowings and overdue books
borrowingSchema.index({ userId: 1, status: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model("Borrowing", borrowingSchema);
