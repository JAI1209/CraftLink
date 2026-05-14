const CommunityChallenge = require("../models/CommunityChallenge");
const { awardReputation } = require("../services/reputationService");

const challengePopulate = [
  { path: "participants.user", select: "name avatar headline xp reputationScore" },
  { path: "submissions.user", select: "name avatar headline xp reputationScore" },
  { path: "winnerShowcase.user", select: "name avatar headline" },
];

const emitChallenge = (challenge) => {
  if (!global.io || !challenge) return;
  global.io.to(`challenge:${challenge._id}`).emit("challenge:updated", { challenge });
  global.io.emit("dashboard:challenge", { challenge });
};

const listChallenges = async (req, res) => {
  try {
    const { status, type, limit = 24 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const challenges = await CommunityChallenge.find(query)
      .populate(challengePopulate)
      .sort({ status: 1, startsAt: 1, endsAt: 1 })
      .limit(Math.min(Number(limit) || 24, 60));

    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await CommunityChallenge.findById(req.params.id).populate(challengePopulate);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    res.status(200).json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const challenge = await CommunityChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const existing = challenge.participants.find(
      (item) => item.user.toString() === req.user._id.toString()
    );
    if (!existing) {
      challenge.participants.push({ user: req.user._id, status: "joined" });
      await challenge.save();
      await awardReputation(req.user._id, "challenge_participation", {
        xp: 20,
        reputation: 14,
      });
    }

    const populated = await CommunityChallenge.findById(challenge._id).populate(challengePopulate);
    emitChallenge(populated);
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitChallenge = async (req, res) => {
  try {
    const challenge = await CommunityChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ message: "Submission title is required" });

    const links = Array.isArray(req.body.links)
      ? req.body.links.map((link) => String(link).trim()).filter(Boolean).slice(0, 6)
      : [];

    const participant = challenge.participants.find(
      (item) => item.user.toString() === req.user._id.toString()
    );
    if (participant) participant.status = "submitted";
    else challenge.participants.push({ user: req.user._id, status: "submitted" });

    const existingSubmission = challenge.submissions.find(
      (item) => item.user.toString() === req.user._id.toString()
    );
    if (existingSubmission) {
      existingSubmission.title = title;
      existingSubmission.description = String(req.body.description || "").trim().slice(0, 1200);
      existingSubmission.links = links;
      existingSubmission.submittedAt = new Date();
    } else {
      challenge.submissions.push({
        user: req.user._id,
        title,
        description: String(req.body.description || "").trim().slice(0, 1200),
        links,
      });
    }

    await challenge.save();
    await awardReputation(req.user._id, "challenge_submission", {
      xp: 35,
      reputation: 24,
      skill: challenge.type?.toLowerCase().includes("ui") ? "ui" : undefined,
    });

    const populated = await CommunityChallenge.findById(challenge._id).populate(challengePopulate);
    emitChallenge(populated);
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChallengeById,
  joinChallenge,
  listChallenges,
  submitChallenge,
};
