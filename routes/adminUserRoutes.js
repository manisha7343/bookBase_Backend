const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  resetPassword,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
} = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT, adminOnly);

// ---- Admin ka apna profile ----
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/password", resetPassword);

// ---- Admin ke special powers ----
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/block", blockUser);
router.put("/:id/unblock", unblockUser);

module.exports = router;