const express = require("express");

const {
  createSkill,
  getSkills,
  getMySkills,
  deleteSkill,
} = require(
  "../controllers/skillController"
);

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();

// GET MY SKILLS
router.get(
  "/my-skills",
  protect,
  getMySkills
);

// GET ALL SKILLS
router.get(
  "/",
  getSkills
);

// CREATE SKILL
router.post(
  "/",
  protect,
  createSkill
);

// DELETE SKILL
router.delete(
  "/:id",
  protect,
  deleteSkill
);

module.exports = router;