const CrowdfundingProject = require("../models/CrowdfundingProject");
const { createNotification } = require("../services/notificationService");
const { awardReputation } = require("../services/reputationService");

const emitDashboardProject = (project) => {
  if (!global.io || !project) return;
  global.io.emit("dashboard:crowdfunding", { project });
};

const sanitizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return [...new Set(skills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean))]
    .slice(0, 12);
};

const sanitizeStrings = (items, limit = 12) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
};

const projectPopulate = [
  { path: "creator", select: "name avatar headline rating totalReviews" },
  { path: "contributors.user", select: "name avatar headline rating totalReviews" },
];

const getProjects = async (req, res) => {
  try {
    const { status, q = "", skill, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit) || 20, 50);
    const query = {};

    query.$or = [
      { visibility: "public" },
      { creator: req.user._id },
      { "contributors.user": req.user._id },
    ];
    if (status) query.status = status;
    else query.status = { $in: ["active", "featured", "funded"] };
    if (skill) query.requiredSkills = String(skill).trim().toLowerCase();
    if (q.trim()) query.$text = { $search: q.trim() };

    const projects = await CrowdfundingProject.find(query)
      .populate(projectPopulate)
      .sort({ status: -1, updatedAt: -1 })
      .limit(safeLimit);

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await CrowdfundingProject.findById(req.params.id).populate(projectPopulate);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const canView = project.visibility === "public"
      || project.creator?._id?.toString() === req.user._id.toString()
      || project.contributors?.some((item) => item.user?._id?.toString() === req.user._id.toString());
    if (!canView) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const summary = String(req.body.summary || "").trim();
    const fundingGoal = Number(req.body.fundingGoal);

    if (!title) return res.status(400).json({ message: "Project title is required" });
    if (!summary) return res.status(400).json({ message: "Project summary is required" });
    if (!Number.isFinite(fundingGoal) || fundingGoal <= 0) {
      return res.status(400).json({ message: "Funding goal must be greater than zero" });
    }

    const project = await CrowdfundingProject.create({
      creator: req.user._id,
      title,
      summary,
      tagline: String(req.body.tagline || "").trim().slice(0, 180),
      description: String(req.body.description || "").trim().slice(0, 5000),
      category: String(req.body.category || "community").trim().toLowerCase().slice(0, 60),
      fundingGoal,
      fundingRaised: Math.max(Number(req.body.fundingRaised) || 0, 0),
      requiredCollaborators: Math.max(Number(req.body.requiredCollaborators) || 1, 1),
      requiredSkills: sanitizeSkills(req.body.requiredSkills),
      roadmap: Array.isArray(req.body.roadmap)
        ? req.body.roadmap.slice(0, 12).map((item) => ({
            title: String(item.title || item).trim().slice(0, 120),
            status: ["planned", "in-progress", "completed"].includes(item.status) ? item.status : "planned",
            dueDate: item.dueDate || null,
          })).filter((item) => item.title)
        : [],
      difficulty: ["Beginner", "Intermediate", "Advanced", "Expert"].includes(req.body.difficulty)
        ? req.body.difficulty
        : "Intermediate",
      deadline: req.body.deadline || null,
      bannerImage: String(req.body.bannerImage || "").trim().slice(0, 1000),
      projectLinks: sanitizeStrings(req.body.projectLinks, 8),
      visibility: req.body.visibility === "private" ? "private" : "public",
      collaborationRoles: sanitizeStrings(req.body.collaborationRoles, 12),
      status: ["draft", "active", "featured", "paused"].includes(req.body.status) ? req.body.status : "active",
    });

    const populated = await CrowdfundingProject.findById(project._id).populate(projectPopulate);
    emitDashboardProject(populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestParticipation = async (req, res) => {
  try {
    const project = await CrowdfundingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You already own this project" });
    }

    const existing = project.contributors.find(
      (item) => item.user.toString() === req.user._id.toString() && item.status === "requested"
    );
    if (existing) return res.status(400).json({ message: "Participation request already pending" });

    project.contributors.push({
      user: req.user._id,
      role: String(req.body.role || "Contributor").trim().slice(0, 80),
      portfolioUrl: String(req.body.portfolioUrl || "").trim().slice(0, 300),
      fullName: String(req.body.fullName || req.user.name || "").trim().slice(0, 120),
      username: String(req.body.username || req.user.email || "").trim().slice(0, 80),
      skills: sanitizeSkills(req.body.skills),
      experienceLevel: String(req.body.experienceLevel || "").trim().slice(0, 80),
      experience: String(req.body.experience || "").trim().slice(0, 700),
      previousWork: String(req.body.previousWork || "").trim().slice(0, 1000),
      availability: String(req.body.availability || "").trim().slice(0, 160),
      contribution: String(req.body.contribution || "").trim().slice(0, 1000),
      motivation: String(req.body.motivation || "").trim().slice(0, 1000),
      socialLinks: sanitizeStrings(req.body.socialLinks, 8),
    });

    await project.save();
    await createNotification({
      recipient: project.creator,
      sender: req.user._id,
      type: "system",
      title: "Crowdfunding collaboration request",
      message: `${req.user.name || "Someone"} requested to join "${project.title}"`,
      link: `/crowdfunding/${project._id}`,
      entityType: "User",
      entityId: req.user._id,
    });

    const populated = await CrowdfundingProject.findById(project._id).populate(projectPopulate);
    emitDashboardProject(populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const decideContributor = async (req, res) => {
  try {
    const project = await CrowdfundingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can manage contributors" });
    }

    const action = req.params.action;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid contributor action" });
    }

    const contributor = project.contributors.id(req.params.contributorId);
    if (!contributor) return res.status(404).json({ message: "Contributor request not found" });

    contributor.status = action === "approve" ? "approved" : "rejected";
    contributor.decidedAt = new Date();
    if (req.body.role) contributor.role = String(req.body.role).trim().slice(0, 80);

    await project.save();
    if (action === "approve") {
      await awardReputation(contributor.user, "project_participation", {
        collaboration: true,
      });
    }
    await createNotification({
      recipient: contributor.user,
      sender: req.user._id,
      type: "system",
      title: action === "approve" ? "Project collaboration approved" : "Project collaboration rejected",
      message: action === "approve"
        ? `You can now collaborate on "${project.title}"`
        : `Your request to join "${project.title}" was rejected`,
      link: `/crowdfunding/${project._id}`,
      entityType: "User",
      entityId: req.user._id,
    });

    const populated = await CrowdfundingProject.findById(project._id).populate(projectPopulate);
    emitDashboardProject(populated);
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  decideContributor,
  getProjectById,
  getProjects,
  requestParticipation,
};
