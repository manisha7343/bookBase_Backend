const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "coverImage") {
      return {
        folder: "books/covers",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }
    if (file.fieldname === "bookFile") {
      return {
        folder: "books/pdfs",
        resource_type: "raw",
        allowed_formats: ["pdf"],
      };
    }
  },
});

const upload = multer({ storage });

module.exports = upload;