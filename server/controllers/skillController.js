const Skill =
  require("../models/Skill");

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
        user: req.user._id,
      });

    res.status(201).json(
      skill
    );
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

    res.status(200).json(
      skills
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MY SKILLS
const getMySkills = async (
  req,
  res
) => {
  try {
    const skills =
      await Skill.find({
        user: req.user._id,
      });

    res.status(200).json(
      skills
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE SKILL
const updateSkill = async (
  req,
  res
) => {
  try {
    const skill =
      await Skill.findById(
        req.params.id
      );

    // CHECK SKILL
    if (!skill) {
      return res.status(404).json({
        message:
          "Skill not found",
      });
    }

    // CHECK OWNER
    if (
      skill.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        message:
          "Not authorized",
      });
    }

    // UPDATE DATA
    skill.title =
      req.body.title ||
      skill.title;

    skill.category =
      req.body.category ||
      skill.category;

    skill.description =
      req.body.description ||
      skill.description;

    skill.price =
      req.body.price ||
      skill.price;

    const updatedSkill =
      await skill.save();

    res.status(200).json(
      updatedSkill
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE SKILL
const deleteSkill = async (
  req,
  res
) => {
  try {
    const skill =
      await Skill.findById(
        req.params.id
      );

    // CHECK SKILL EXISTS
    if (!skill) {
      return res.status(404).json({
        message:
          "Skill not found",
      });
    }

    // CHECK OWNER
    if (
      skill.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        message:
          "Not authorized",
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      message:
        "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSkill,
  getSkills,
  getMySkills,
  updateSkill,
  deleteSkill,
};