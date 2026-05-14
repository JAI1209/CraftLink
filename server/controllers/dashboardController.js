const CollabNote = require("../models/CollabNote");
const CommunityChallenge = require("../models/CommunityChallenge");
const CrowdfundingProject = require("../models/CrowdfundingProject");
const User = require("../models/User");

const fallbackChallenges = [
  {
    _id: "ui-systems-review",
    title: "Design System Review Sprint",
    type: "UI/UX challenge",
    status: "active",
    participantsCount: 42,
    rewards: { xp: 650, badges: ["UI Expert"] },
  },
  {
    _id: "api-resilience-week",
    title: "API Resilience Challenge",
    type: "backend/API challenge",
    status: "upcoming",
    participantsCount: 28,
    rewards: { xp: 720, badges: ["Backend/API Specialist"] },
  },
  {
    _id: "prompt-research-lab",
    title: "Prompt Research Lab",
    type: "AI prompt competition",
    status: "active",
    participantsCount: 36,
    rewards: { xp: 580, badges: ["Research Specialist"] },
  },
];

const fallbackProjects = [
  {
    _id: "creator-toolkit",
    title: "Creator Operations Toolkit",
    summary: "A workspace for project intake, delivery milestones, and client reporting.",
    status: "featured",
    fundingGoal: 250000,
    fundingRaised: 156000,
    requiredSkills: ["frontend", "node", "product-design"],
    requiredCollaborators: 4,
    contributorsCount: 2,
  },
  {
    _id: "research-vault",
    title: "Community Research Vault",
    summary: "Shared research repository for technical notes, benchmarks, and briefs.",
    status: "active",
    fundingGoal: 180000,
    fundingRaised: 72000,
    requiredSkills: ["research", "backend", "documentation"],
    requiredCollaborators: 3,
    contributorsCount: 1,
  },
];

const normalizeChallenge = (challenge) => ({
  _id: challenge._id,
  title: challenge.title,
  type: challenge.type,
  status: challenge.status,
  participantsCount: challenge.participants?.length || challenge.participantsCount || 0,
  rewards: challenge.rewards || { xp: 0, badges: [] },
  startsAt: challenge.startsAt,
  endsAt: challenge.endsAt,
});

const normalizeProject = (project) => ({
  _id: project._id,
  title: project.title,
  summary: project.summary,
  status: project.status,
  fundingGoal: project.fundingGoal,
  fundingRaised: project.fundingRaised,
  requiredSkills: project.requiredSkills || [],
  requiredCollaborators: project.requiredCollaborators,
  contributorsCount: project.contributors?.filter((item) =>
    ["approved", "active"].includes(item.status)
  ).length || project.contributorsCount || 0,
  creator: project.creator,
});

const getDashboardHub = async (req, res) => {
  try {
    const [user, activeChallenges, upcomingChallenges, projects, topContributors, trendingNotes] =
      await Promise.all([
        User.findById(req.user._id).select(
          "name email avatar xp reputationScore activityLevel badges rating totalReviews"
        ),
        CommunityChallenge.find({ status: "active" })
          .sort({ endsAt: 1 })
          .limit(4)
          .lean(),
        CommunityChallenge.find({ status: "upcoming" })
          .sort({ startsAt: 1 })
          .limit(4)
          .lean(),
        CrowdfundingProject.find({ status: { $in: ["active", "featured"] } })
          .populate("creator", "name avatar headline")
          .sort({ status: -1, updatedAt: -1 })
          .limit(4)
          .lean(),
        User.find({ _id: { $ne: req.user._id } })
          .select("name avatar headline reputationScore xp activityLevel")
          .sort({ reputationScore: -1, xp: -1 })
          .limit(5)
          .lean(),
        CollabNote.find({ visibility: "public", archived: false })
          .select("title category commentsCount likesCount owner updatedAt")
          .populate("owner", "name avatar headline")
          .sort({ likesCount: -1, commentsCount: -1, updatedAt: -1 })
          .limit(4)
          .lean(),
      ]);

    const badges = user?.badges || [];
    const xp = user?.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const currentLevelXp = xp % 1000;
    const active = activeChallenges.length ? activeChallenges : fallbackChallenges.filter((item) => item.status === "active");
    const upcoming = upcomingChallenges.length ? upcomingChallenges : fallbackChallenges.filter((item) => item.status === "upcoming");
    const projectCards = projects.length ? projects : fallbackProjects;

    res.status(200).json({
      xp: {
        total: xp,
        level,
        progress: Math.min(Math.round((currentLevelXp / 1000) * 100), 100),
        nextLevelXp: 1000 - currentLevelXp,
        badges,
        streak: badges.length ? Math.min(badges.length + 2, 14) : 0,
        contributionStats: {
          reputationScore: user?.reputationScore || 0,
          activityLevel: user?.activityLevel || "Emerging",
          totalReviews: user?.totalReviews || 0,
        },
      },
      challenges: {
        active: active.map(normalizeChallenge),
        upcoming: upcoming.map(normalizeChallenge),
        leaderboard: topContributors.slice(0, 3),
        participationStats: {
          activeCount: active.length,
          upcomingCount: upcoming.length,
          totalParticipants: [...active, ...upcoming].reduce(
            (sum, challenge) => sum + (challenge.participants?.length || challenge.participantsCount || 0),
            0
          ),
        },
      },
      crowdfunding: {
        projects: projectCards.map(normalizeProject),
        featured: projectCards.find((project) => project.status === "featured") || projectCards[0] || null,
      },
      community: {
        trendingDiscussions: trendingNotes,
        topContributors,
        metrics: {
          publicNotes: trendingNotes.length,
          activeCollaborators: topContributors.length,
          reputationScore: user?.reputationScore || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardHub,
};
