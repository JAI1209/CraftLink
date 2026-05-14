const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getChallengeById,
  joinChallenge,
  listChallenges,
  submitChallenge,
} = require("../controllers/challengeController");

const router = express.Router();

router.use(protect);

router.get("/", listChallenges);
router.get("/:id", getChallengeById);
router.post("/:id/join", joinChallenge);
router.post("/:id/submissions", submitChallenge);

module.exports = router;
