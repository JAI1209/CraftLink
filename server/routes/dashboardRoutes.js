const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getDashboardHub } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/hub", protect, getDashboardHub);

module.exports = router;
