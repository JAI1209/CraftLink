const Skill = require("../models/Skill");
const User = require("../models/User");

const createSkill = async (req, res) => {
  try {
    const { title, category, description, price, tags, type, mode } = req.body;
    const skill = await Skill.create({
      title, category, description, price,
      tags: tags || [], type: type || "offer", mode: mode || "paid",
      user: req.user._id,
    });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const { q, category, type, mode, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (type) filter.type = type;
    if (mode) filter.mode = mode;
    if (q) filter.$text = { $search: q };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Skill.countDocuments(filter);
    const skills = await Skill.find(filter)
      .populate("user", "name email avatar rating")
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.status(200).json({ skills, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate("user", "name email avatar bio rating totalReviews location headline");
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Not authorized" });
    const fields = ["title","category","description","price","tags","type","mode","status"];
    fields.forEach(f => { if (req.body[f] !== undefined) skill[f] = req.body[f]; });
    const updated = await skill.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Not authorized" });
    await skill.deleteOne();
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    const alreadySaved = user.savedSkills.includes(skill._id);
    if (alreadySaved) {
      user.savedSkills = user.savedSkills.filter(item => item.toString() !== skill._id.toString());
      await user.save();
      return res.status(200).json({ message: "Skill removed from favorites" });
    }
    user.savedSkills.push(skill._id);
    await user.save();
    res.status(200).json({ message: "Skill saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSkill, getSkills, getSkillById, getMySkills, updateSkill, deleteSkill, saveSkill };
