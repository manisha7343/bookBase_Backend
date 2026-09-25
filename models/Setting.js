const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      default: "BookBase Central Library",
      trim: true,
    },
    maxBooks: {
      type: Number,
      default: 5,
      min: 1,
    },
    borrowDuration: {
      type: Number,
      default: 14, // in days
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
