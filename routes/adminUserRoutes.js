const express = require("express");
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
} = require("../controllers/userController");
const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/block", blockUser);
router.put("/:id/unblock", unblockUser);

module.exports = router;