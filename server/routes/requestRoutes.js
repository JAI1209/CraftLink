const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.post("/", protect, sendRequest);
router.get("/sent", protect, getSentRequests);
router.get("/received", protect, getReceivedRequests);
router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);
router.put("/:id/complete", protect, completeRequest);

module.exports = router;
