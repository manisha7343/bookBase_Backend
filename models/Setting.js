const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      default: "BookBase Central Library",
      trim: true
    },
    maxBooksPerUser: {
      type: Number,
      default: 5,
      min: 1
    },
    borrowDuration: {
      type: Number, // in days
      default: 14,
      min: 1
    },
    contactEmail: {
      type: String,
      default: "admin@bookbase.library",
      trim: true
    },
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
      trim: true
    },
    libraryAddress: {
      type: String,
      default: "123 Campus Central Library",
      trim: true
    },
    finePerDay: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
