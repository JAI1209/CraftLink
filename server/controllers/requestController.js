const Request = require("../models/Request");
const Skill = require("../models/Skill");
const { createNotification } = require("../services/notificationService");
const { awardReputation } = require("../services/reputationService");

// SEND REQUEST
const sendRequest = async (req, res) => {
  try {
    const { skillId, message, type, amount } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    // Can't request your own skill
    if (skill.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot request your own skill" });
    }

    // Prevent duplicate pending requests
    const existing = await Request.findOne({
      from: req.user._id,
      skill: skillId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await Request.create({
      from: req.user._id,
      to: skill.user,
      skill: skillId,
      message,
      type: type || "paid",
      amount: amount || skill.price,
    });

    const populated = await Request.findById(request._id)
      .populate("from", "name avatar")
      .populate("to", "name avatar")
      .populate("skill", "title category price");

    await createNotification({
      recipient: skill.user,
      sender: req.user._id,
      type: "request",
      title: "New skill request",
      message: `${req.user.name || "Someone"} requested ${skill.title}`,
      link: "/requests",
      entityType: "Request",
      entityId: request._id,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SENT REQUESTS
const getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ from: req.user._id })
      .populate("to", "name avatar")
      .populate("skill", "title category price")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET RECEIVED REQUESTS
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ to: req.user._id })
      .populate("from", "name avatar")
      .populate("skill", "title category price")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT REQUEST
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }
    request.status = "accepted";
    await request.save();

    await createNotification({
      recipient: request.from,
      sender: req.user._id,
      type: "request_accepted",
      title: "Request accepted",
      message: "Your skill request was accepted",
      link: "/requests",
      entityType: "Request",
      entityId: request._id,
    });

    await Promise.all([
      awardReputation(request.to, "request_completed"),
      awardReputation(request.from, "request_completed", { xp: 15, reputation: 12 }),
    ]);

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT REQUEST
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }
    request.status = "rejected";
    await request.save();

    await createNotification({
      recipient: request.from,
      sender: req.user._id,
      type: "request_rejected",
      title: "Request declined",
      message: "Your skill request was declined",
      link: "/requests",
      entityType: "Request",
      entityId: request._id,
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPLETE REQUEST
const completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const isParty =
      request.from.toString() === req.user._id.toString() ||
      request.to.toString() === req.user._id.toString();
    if (!isParty) return res.status(401).json({ message: "Not authorized" });
    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Request must be accepted first" });
    }
    request.status = "completed";
    await request.save();

    const recipient =
      request.from.toString() === req.user._id.toString()
        ? request.to
        : request.from;

    await createNotification({
      recipient,
      sender: req.user._id,
      type: "request_completed",
      title: "Request completed",
      message: "A skill request was marked complete",
      link: "/requests",
      entityType: "Request",
      entityId: request._id,
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
};
