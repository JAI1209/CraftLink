const Skill = require("../models/Skill");

// CREATE SKILL
const createSkill = async (
  req,
  res
) => {
  try {
    const {
      title,
      category,
      description,
      price,
    } = req.body;

    const skill =
      await Skill.create({
        title,
        category,
        description,
        price,
        user: req.user,
      });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL SKILLS
const getSkills = async (
  req,
  res
) => {
  try {
    const skills =
      await Skill.find().populate(
        "user",
        "name email"
      );

    res.json(skills);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSkill,
  getSkills,
};