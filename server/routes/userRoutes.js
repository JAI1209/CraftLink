const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getUserProfile, updateProfile, searchUsers } = require("../controllers/userController");

router.get("/search", searchUsers);
router.get("/profile/:id", getUserProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
