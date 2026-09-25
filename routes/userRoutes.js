const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  resetPassword,
} = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyJWT);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/password", resetPassword);

module.exports = router;