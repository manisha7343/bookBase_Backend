const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    publicationInfo: {
      publisher: {
        type: String,
        trim: true,
      },

      publicationDate: {
        type: Date,
      },

      edition: {
        type: String,
        trim: true,
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    coverImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);


// --------------------------------------Method	URL	Purpose
// GET	/api/books	                           All books
// GET	/api/books/:id                         Book details
// GET	/api/books/search?title=java	       Search
// POST	/api/admin/books	                   Create
// GET	/api/admin/books	                   All books
// GET	/api/admin/books/:id	               Details
// PUT	/api/admin/books/:id	               Update
// DELETE	/api/admin/books/:id	           Delete