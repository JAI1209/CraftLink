const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  postReview,
  getUserReviews,
  getMyReviewForRequest,
  getMyReviewedRequestIds,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", protect, postReview);
router.get("/user/:id", getUserReviews);
router.get("/mine", protect, getMyReviewedRequestIds);
router.get("/request/:requestId/me", protect, getMyReviewForRequest);
router.delete("/:id", protect, deleteReview);

module.exports = router;
