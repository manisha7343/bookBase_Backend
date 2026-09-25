const express = require("express");
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
} = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyJWT, checkRole("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/block", blockUser);
router.put("/:id/unblock", unblockUser);

module.exports = router;