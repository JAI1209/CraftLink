const User = require("../models/User");

const XP_EVENTS = {
  request_completed: 30,
  good_review: 40,
  note_liked: 8,
  note_comment: 6,
  collaboration_joined: 25,
  collaboration_help: 15,
  project_participation: 35,
  challenge_participation: 20,
  challenge_submission: 35,
  challenge_win: 100,
  discussion_quality: 20,
};

const BADGES = {
  top_collaborator: {
    key: "top_collaborator",
    label: "Top Collaborator",
    description: "Actively contributes to shared workspaces and collaboration notes.",
    category: "collaboration",
  },
  community_helper: {
    key: "community_helper",
    label: "Community Helper",
    description: "Regularly helps others through comments, replies, and feedback.",
    category: "community",
  },
  knowledge_contributor: {
    key: "knowledge_contributor",
    label: "Knowledge Contributor",
    description: "Shares valuable research, notes, or technical insight.",
    category: "community",
  },
  trusted_creator: {
    key: "trusted_creator",
    label: "Trusted Creator",
    description: "Earned strong reputation through completed work and reviews.",
    category: "reputation",
  },
  frontend_architect: {
    key: "frontend_architect",
    label: "Frontend Architect",
    description: "Recognized for frontend and UI architecture contributions.",
    category: "skill",
  },
  ui_expert: {
    key: "ui_expert",
    label: "UI Expert",
    description: "Delivers strong interface design and UX challenge work.",
    category: "challenge",
  },
  research_specialist: {
    key: "research_specialist",
    label: "Research Specialist",
    description: "Contributes structured research and problem-solving insight.",
    category: "challenge",
  },
  prompt_engineer: {
    key: "prompt_engineer",
    label: "Prompt Engineer",
    description: "Creates practical AI workflows and prompt systems.",
    category: "skill",
  },
  challenge_winner: {
    key: "challenge_winner",
    label: "Challenge Winner",
    description: "Won a CraftLink community challenge.",
    category: "challenge",
  },
};

const getActivityLevel = (xp) => {
  if (xp >= 2500) return "Leader";
  if (xp >= 1200) return "Expert";
  if (xp >= 500) return "Trusted";
  if (xp >= 150) return "Skilled";
  return "Emerging";
};

const addBadgeIfMissing = (user, badgeKey) => {
  const badge = BADGES[badgeKey];
  if (!badge) return;
  if (user.badges?.some((item) => item.key === badge.key)) return;
  user.badges.push({ ...badge, earnedAt: new Date() });
};

const evaluateBadges = (user, eventType, metadata = {}) => {
  if (user.xp >= 150) addBadgeIfMissing(user, "knowledge_contributor");
  if (user.reputationScore >= 300 || user.rating >= 4.5 && user.totalReviews >= 3) {
    addBadgeIfMissing(user, "trusted_creator");
  }
  if (eventType === "collaboration_joined" || metadata.collaboration) {
    addBadgeIfMissing(user, "top_collaborator");
  }
  if (["note_comment", "collaboration_help"].includes(eventType)) {
    addBadgeIfMissing(user, "community_helper");
  }
  if (metadata.skill === "frontend" || metadata.skill === "ui") {
    addBadgeIfMissing(user, "frontend_architect");
  }
  if (metadata.skill === "ui") addBadgeIfMissing(user, "ui_expert");
  if (metadata.skill === "research") addBadgeIfMissing(user, "research_specialist");
  if (metadata.skill === "prompt") addBadgeIfMissing(user, "prompt_engineer");
  if (eventType === "challenge_win") addBadgeIfMissing(user, "challenge_winner");
};

const awardReputation = async (userId, eventType, metadata = {}) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const xpGain = Number(metadata.xp ?? XP_EVENTS[eventType] ?? 0);
  const reputationGain = Number(metadata.reputation ?? Math.ceil(xpGain * 0.8));

  user.xp = Math.max((user.xp || 0) + xpGain, 0);
  user.reputationScore = Math.max((user.reputationScore || 0) + reputationGain, 0);
  user.activityLevel = getActivityLevel(user.xp);
  evaluateBadges(user, eventType, metadata);

  await user.save();

  if (global.io) {
    const onlineUsers = global.onlineUsers || [];
    const socketUser = onlineUsers.find((item) => item.userId === userId.toString());
    if (socketUser) {
      global.io.to(socketUser.socketId).emit("reputation:updated", {
        xp: user.xp,
        reputationScore: user.reputationScore,
        activityLevel: user.activityLevel,
        badges: user.badges,
        eventType,
      });
    }
  }

  return user;
};

module.exports = {
  awardReputation,
  BADGES,
  XP_EVENTS,
};
