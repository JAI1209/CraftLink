const User = require("../models/User");

// GET PUBLIC PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE (authenticated user)
const updateProfile = async (req, res) => {
  try {
    const {
      name, bio, headline, location, skills, github, linkedin,
      portfolio, experienceLevel, openToWork, avatar,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (location !== undefined) user.location = location;
    if (skills !== undefined) user.skills = skills;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (openToWork !== undefined) user.openToWork = openToWork;
    if (avatar !== undefined) user.avatar = avatar;

    const updated = await user.save();
    const { password: _, ...userWithoutPassword } = updated.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH USERS
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { skills: { $in: [new RegExp(q, "i")] } },
          ],
        }
      : {};
    const users = await User.find(query).select("-password").limit(20);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateProfile, searchUsers };
