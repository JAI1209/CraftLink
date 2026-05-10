const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// GENERATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// REGISTER USER
const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      avatar,
    } = req.body;

    // CHECK EXISTING USER
    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    // HASH PASSWORD
    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // CREATE USER
    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        avatar,
      });

    res.status(201).json({
      message:
        "User registered successfully",
      token: generateToken(
        user._id
      ),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN USER
const loginUser = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    // CHECK USER
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    // SUCCESS RESPONSE
    res.status(200).json({
      message:
        "Login successful",
      token: generateToken(
        user._id
      ),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET CURRENT USER
const getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};