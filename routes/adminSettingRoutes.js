const express = require("express");
const {
  getSettings,
  updateSettings
} = require("../controllers/settingController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth & admin check to all setting routes
router.use(verifyJWT, adminOnly);

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
