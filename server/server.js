const express = require("express");
const cors = require("cors");

require("dotenv").config();
const protect = require("./middleware/authMiddleware");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");


const app = express();

// CONNECT DATABASE
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// SKILL ROUTES
app.use("/api/skills", skillRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("CraftLink API Running 🚀");
});

// PORT
const PORT =
  process.env.PORT || 5000;

// SERVER
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});