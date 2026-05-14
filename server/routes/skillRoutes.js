const express = require("express");
const { createSkill, getSkills, getSkillById, getMySkills, updateSkill, deleteSkill, saveSkill } = require("../controllers/skillController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/my-skills", protect, getMySkills);
router.get("/", getSkills);
router.get("/:id", getSkillById);
router.post("/", protect, createSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);
router.post("/save/:id", protect, saveSkill);

module.exports = router;
