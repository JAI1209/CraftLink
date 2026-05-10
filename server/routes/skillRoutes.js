const express = require("express");

const {
  createSkill,
  getSkills,
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL SKILLS
router.get("/", getSkills);

// CREATE SKILL
router.post(
  "/",
  protect,
  createSkill
);

module.exports = router;