const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post(
  "/register",
  registerUser
);

// LOGIN
router.post(
  "/login",
  loginUser
);

// GET CURRENT USER
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;