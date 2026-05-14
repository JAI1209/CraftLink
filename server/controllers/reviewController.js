const Review = require("../models/Review");
const Request = require("../models/Request");
const User = require("../models/User");
const { awardReputation } = require("../services/reputationService");

const updateUserRatingStats = async (userId) => {
  const [stats] = await Review.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: "$reviewee",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await User.findByIdAndUpdate(userId, {
    rating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
    totalReviews: stats?.totalReviews || 0,
  });
};

const postReview = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    const numericRating = Number(rating);

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const request = await Request.findById(requestId).populate("skill", "title");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Request must be completed before reviewing" });
    }

    if (request.from.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Only the requester can leave a review" });
    }

    if (request.to.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const existingReview = await Review.findOne({ request: requestId });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted for this request" });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: request.to,
      request: requestId,
      rating: numericRating,
      comment: (comment || "").trim(),
    });

    await updateUserRatingStats(request.to);
    if (numericRating >= 4) {
      await awardReputation(request.to, "good_review", {
        reputation: numericRating * 12,
      });
    }

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name avatar")
      .populate("reviewee", "name avatar rating totalReviews")
      .populate({
        path: "request",
        select: "skill completedAt createdAt",
        populate: { path: "skill", select: "title category" },
      });

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Review already submitted for this request" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("rating totalReviews");
    if (!user) return res.status(404).json({ message: "User not found" });

    const reviews = await Review.find({ reviewee: req.params.id })
      .populate("reviewer", "name avatar")
      .populate({
        path: "request",
        select: "skill createdAt",
        populate: { path: "skill", select: "title category" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      reviews,
      summary: {
        averageRating: user.rating || 0,
        totalReviews: user.totalReviews || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReviewForRequest = async (req, res) => {
  try {
    const review = await Review.findOne({
      request: req.params.requestId,
      reviewer: req.user._id,
    });

    res.status(200).json({ reviewed: Boolean(review), review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReviewedRequestIds = async (req, res) => {
  try {
    const requestIds = (req.query.requestIds || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (requestIds.length === 0) {
      return res.status(200).json({ reviewedRequestIds: [] });
    }

    const reviews = await Review.find({
      reviewer: req.user._id,
      request: { $in: requestIds },
    }).select("request");

    res.status(200).json({
      reviewedRequestIds: reviews.map((review) => review.request.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const reviewee = review.reviewee;
    await review.deleteOne();
    await updateUserRatingStats(reviewee);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postReview,
  getUserReviews,
  getMyReviewForRequest,
  getMyReviewedRequestIds,
  deleteReview,
};
