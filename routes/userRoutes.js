const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  resetPassword,
} = require("../controllers/userController");
const router = express.Router();

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/password", resetPassword);

module.exports = router;