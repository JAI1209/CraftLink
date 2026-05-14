const mongoose = require("mongoose");
const CollabNote = require("../models/CollabNote");
const CollabNoteComment = require("../models/CollabNoteComment");
const CollabNoteLike = require("../models/CollabNoteLike");
const CollabNoteParticipationRequest = require("../models/CollabNoteParticipationRequest");
const CollabNoteVersion = require("../models/CollabNoteVersion");
const SavedCollabNote = require("../models/SavedCollabNote");
const { createNotification } = require("../services/notificationService");
const { awardReputation } = require("../services/reputationService");
const {
  canCommentNote,
  canEditNote,
  canManageNote,
  canShareNote,
  canViewNote,
  emitNoteEvent,
  findAccessibleNote,
  makeExcerpt,
  sanitizeTags,
  toId,
} = require("../services/collabNoteService");

const notePopulate = [
  { path: "owner", select: "name avatar headline rating totalReviews" },
  { path: "lastEditedBy", select: "name avatar" },
  { path: "collaborators.user", select: "name avatar headline" },
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createInitialVersion = (note, userId) => {
  return CollabNoteVersion.create({
    note: note._id,
    version: note.currentVersion,
    title: note.title,
    content: note.content,
    changedBy: userId,
    changeSummary: "Initial draft",
  });
};

const createNote = async (req, res) => {
  try {
    const {
      title,
      content = "",
      visibility = "private",
      category = "general",
      tags = [],
      pinned = false,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Note title is required" });
    }

    const note = await CollabNote.create({
      title: title.trim(),
      content,
      excerpt: makeExcerpt(content),
      owner: req.user._id,
      visibility,
      category,
      tags: sanitizeTags(tags),
      pinned: Boolean(pinned),
      lastEditedBy: req.user._id,
      lastEditedAt: new Date(),
    });

    await createInitialVersion(note, req.user._id);

    const populated = await CollabNote.findById(note._id).populate(notePopulate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const {
      scope = "mine",
      q = "",
      category,
      tag,
      limit = 20,
    } = req.query;

    const safeLimit = Math.min(Number(limit) || 20, 50);
    const query = { archived: false };

    if (scope === "public" || scope === "trending") {
      query.visibility = "public";
    } else if (scope === "shared") {
      query["collaborators.user"] = req.user._id;
    } else if (scope === "saved") {
      const saved = await SavedCollabNote.find({ user: req.user._id }).select("note");
      query._id = { $in: saved.map((item) => item.note) };
    } else {
      query.$or = [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
      ];
    }

    if (category) query.category = category;
    if (tag) query.tags = String(tag).toLowerCase();
    if (q.trim()) query.$text = { $search: q.trim() };

    const notes = await CollabNote.find(query)
      .populate(notePopulate)
      .sort(scope === "trending"
        ? { likesCount: -1, commentsCount: -1, updatedAt: -1 }
        : { pinned: -1, updatedAt: -1 })
      .limit(safeLimit)
      .lean();

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await CollabNote.findById(req.params.id).populate(notePopulate);
    if (!canViewNote(note, req.user?._id)) {
      return res.status(404).json({ message: "Note not found" });
    }

    const saved = await SavedCollabNote.exists({
      user: req.user._id,
      note: note._id,
    });
    const liked = await CollabNoteLike.exists({
      user: req.user._id,
      note: note._id,
    });
    const participationRequest = await CollabNoteParticipationRequest.findOne({
      requester: req.user._id,
      note: note._id,
      status: "pending",
    }).select("_id status requestedRole message");

    res.status(200).json({
      note,
      saved: Boolean(saved),
      liked: Boolean(liked),
      participationRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!canEditNote(note, req.user._id)) {
      return res.status(403).json({ message: "You do not have edit access to this note" });
    }

    const {
      title,
      content,
      visibility,
      category,
      tags,
      pinned,
      changeSummary = "",
    } = req.body;

    const contentChanged = content !== undefined && content !== note.content;
    const titleChanged = title !== undefined && title.trim() !== note.title;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: "Note title is required" });
      note.title = title.trim();
    }
    if (content !== undefined) {
      note.content = content;
      note.excerpt = makeExcerpt(content);
    }
    if (visibility !== undefined && canManageNote(note, req.user._id)) note.visibility = visibility;
    if (category !== undefined) note.category = category;
    if (tags !== undefined) note.tags = sanitizeTags(tags);
    if (pinned !== undefined) note.pinned = Boolean(pinned);

    note.lastEditedBy = req.user._id;
    note.lastEditedAt = new Date();

    if (contentChanged || titleChanged) {
      note.currentVersion += 1;
    }

    await note.save();

    if (contentChanged || titleChanged) {
      await CollabNoteVersion.create({
        note: note._id,
        version: note.currentVersion,
        title: note.title,
        content: note.content,
        changedBy: req.user._id,
        changeSummary: changeSummary.trim().slice(0, 240),
      });
    }

    const populated = await CollabNote.findById(note._id).populate(notePopulate);

    emitNoteEvent(note._id, "note:updated", {
      noteId: note._id.toString(),
      note: populated,
      editedBy: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await CollabNote.findById(req.params.id);
    if (!note || note.archived) return res.status(404).json({ message: "Note not found" });
    if (!canManageNote(note, req.user._id)) {
      return res.status(403).json({ message: "Only the owner can archive this note" });
    }

    note.archived = true;
    await note.save();

    emitNoteEvent(note._id, "note:archived", { noteId: note._id.toString() });
    res.status(200).json({ message: "Note archived" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCollaborators = async (req, res) => {
  try {
    const note = await CollabNote.findById(req.params.id);
    if (!note || note.archived) return res.status(404).json({ message: "Note not found" });
    if (!canShareNote(note, req.user._id)) {
      return res.status(403).json({ message: "You do not have access to share this note" });
    }

    const collaborators = Array.isArray(req.body.collaborators)
      ? req.body.collaborators
      : [];

    const existingCollaboratorIds = new Set(
      note.collaborators.map((entry) => toId(entry.user))
    );

    const requestedCollaborators = collaborators
      .filter((entry) => isValidObjectId(entry.user) && toId(entry.user) !== toId(req.user._id))
      .map((entry) => ({
        user: entry.user,
        role: ["viewer", "commenter", "editor"].includes(entry.role) ? entry.role : "viewer",
        addedBy: req.user._id,
        addedAt: new Date(),
      }));

    if (canManageNote(note, req.user._id)) {
      note.collaborators = requestedCollaborators;
    } else {
      const existingByUser = new Map(
        note.collaborators.map((entry) => [toId(entry.user), entry])
      );
      requestedCollaborators.forEach((entry) => {
        if (!existingByUser.has(toId(entry.user))) {
          note.collaborators.push(entry);
        }
      });
    }

    if (note.collaborators.length > 0 && note.visibility === "private") {
      note.visibility = "shared";
    }

    await note.save();

    const populated = await CollabNote.findById(note._id).populate(notePopulate);

    await Promise.all(
      note.collaborators
        .filter((entry) => !existingCollaboratorIds.has(toId(entry.user)))
        .map((entry) =>
          createNotification({
            recipient: entry.user,
            sender: req.user._id,
            type: "system",
            title: "Shared note access",
            message: `${req.user.name || "Someone"} shared "${note.title}" with you`,
            link: `/notes/${note._id}`,
            entityType: "User",
            entityId: req.user._id,
          })
        )
    );

    emitNoteEvent(note._id, "note:collaborators", {
      noteId: note._id.toString(),
      collaborators: populated.collaborators,
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const comments = await CollabNoteComment.find({ note: note._id })
      .populate("author", "name avatar headline")
      .populate("reactions.user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!canCommentNote(note, req.user._id)) {
      return res.status(403).json({ message: "You do not have comment access to this note" });
    }

    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ message: "Comment is required" });
    if (req.body.parent) {
      const parent = await CollabNoteComment.findOne({
        _id: req.body.parent,
        note: note._id,
      });
      if (!parent) return res.status(400).json({ message: "Parent comment not found" });
    }

    const comment = await CollabNoteComment.create({
      note: note._id,
      author: req.user._id,
      body,
      parent: req.body.parent || null,
    });

    note.commentsCount += 1;
    await note.save();

    const populated = await CollabNoteComment.findById(comment._id)
      .populate("author", "name avatar headline")
      .populate("reactions.user", "name avatar");

    emitNoteEvent(note._id, "note:comment", {
      noteId: note._id.toString(),
      comment: populated,
    });

    if (toId(note.owner) !== toId(req.user._id)) {
      await createNotification({
        recipient: note.owner,
        sender: req.user._id,
        type: "system",
        title: "New note comment",
        message: `${req.user.name || "Someone"} commented on "${note.title}"`,
        link: `/notes/${note._id}`,
        entityType: "User",
        entityId: req.user._id,
      });
    }
    await awardReputation(req.user._id, "note_comment", { collaboration: true });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleSaveNote = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const existing = await SavedCollabNote.findOne({ user: req.user._id, note: note._id });
    if (existing) {
      await existing.deleteOne();
      note.savesCount = Math.max(note.savesCount - 1, 0);
      await note.save();
      return res.status(200).json({ saved: false, savesCount: note.savesCount });
    }

    await SavedCollabNote.create({ user: req.user._id, note: note._id });
    note.savesCount += 1;
    await note.save();

    res.status(200).json({ saved: true, savesCount: note.savesCount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ saved: true });
    }
    res.status(500).json({ message: error.message });
  }
};

const toggleLikeNote = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const existing = await CollabNoteLike.findOne({ user: req.user._id, note: note._id });
    if (existing) {
      await existing.deleteOne();
      note.likesCount = Math.max(note.likesCount - 1, 0);
      await note.save();
      emitNoteEvent(note._id, "note:liked", {
        noteId: note._id.toString(),
        liked: false,
        likesCount: note.likesCount,
        userId: req.user._id.toString(),
      });
      return res.status(200).json({ liked: false, likesCount: note.likesCount });
    }

    await CollabNoteLike.create({ user: req.user._id, note: note._id });
    note.likesCount += 1;
    await note.save();
    if (toId(note.owner) !== toId(req.user._id)) {
      await awardReputation(note.owner, "note_liked", { collaboration: true });
    }

    emitNoteEvent(note._id, "note:liked", {
      noteId: note._id.toString(),
      liked: true,
      likesCount: note.likesCount,
      userId: req.user._id.toString(),
    });

    res.status(200).json({ liked: true, likesCount: note.likesCount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ liked: true });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await CollabNoteComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const note = await findAccessibleNote(comment.note, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (toId(comment.author) !== toId(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ message: "Comment is required" });

    comment.body = body;
    comment.editedAt = new Date();
    await comment.save();

    const populated = await CollabNoteComment.findById(comment._id)
      .populate("author", "name avatar headline")
      .populate("reactions.user", "name avatar");

    emitNoteEvent(note._id, "note:comment:updated", {
      noteId: note._id.toString(),
      comment: populated,
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await CollabNoteComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const note = await findAccessibleNote(comment.note, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    const canDelete = toId(comment.author) === toId(req.user._id) || canManageNote(note, req.user._id);
    if (!canDelete) {
      return res.status(403).json({ message: "You cannot delete this comment" });
    }

    const childCount = await CollabNoteComment.countDocuments({ parent: comment._id });
    await CollabNoteComment.deleteMany({
      $or: [{ _id: comment._id }, { parent: comment._id }],
    });

    note.commentsCount = Math.max(note.commentsCount - 1 - childCount, 0);
    await note.save();

    emitNoteEvent(note._id, "note:comment:deleted", {
      noteId: note._id.toString(),
      commentId: comment._id.toString(),
    });

    res.status(200).json({ message: "Comment deleted", commentId: comment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleCommentReaction = async (req, res) => {
  try {
    const comment = await CollabNoteComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const note = await findAccessibleNote(comment.note, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const type = ["like", "insightful", "helpful"].includes(req.body.type)
      ? req.body.type
      : "like";
    const existingIndex = comment.reactions.findIndex(
      (reaction) => toId(reaction.user) === toId(req.user._id) && reaction.type === type
    );

    if (existingIndex >= 0) {
      comment.reactions.splice(existingIndex, 1);
    } else {
      comment.reactions.push({ user: req.user._id, type });
    }

    await comment.save();

    const populated = await CollabNoteComment.findById(comment._id)
      .populate("author", "name avatar headline")
      .populate("reactions.user", "name avatar");

    emitNoteEvent(note._id, "note:comment:reaction", {
      noteId: note._id.toString(),
      comment: populated,
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestParticipation = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (toId(note.owner) === toId(req.user._id)) {
      return res.status(400).json({ message: "You already own this note" });
    }
    if (note.collaborators.some((entry) => toId(entry.user) === toId(req.user._id))) {
      return res.status(400).json({ message: "You already have access to this note" });
    }

    const requestedRole = ["viewer", "commenter", "editor"].includes(req.body.requestedRole)
      ? req.body.requestedRole
      : "editor";

    const participationRequest = await CollabNoteParticipationRequest.create({
      note: note._id,
      requester: req.user._id,
      owner: note.owner,
      message: String(req.body.message || "").trim(),
      requestedRole,
    });

    note.participationRequestsCount += 1;
    await note.save();

    const populated = await CollabNoteParticipationRequest.findById(participationRequest._id)
      .populate("requester", "name avatar headline rating totalReviews");

    emitNoteEvent(note._id, "note:participation:requested", {
      noteId: note._id.toString(),
      request: populated,
    });

    await createNotification({
      recipient: note.owner,
      sender: req.user._id,
      type: "system",
      title: "Collaboration request",
      message: `${req.user.name || "Someone"} requested to join "${note.title}"`,
      link: `/notes/${note._id}`,
      entityType: "User",
      entityId: req.user._id,
    });

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Participation request already pending" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getParticipationRequests = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!canManageNote(note, req.user._id)) {
      return res.status(403).json({ message: "Only the owner can view requests" });
    }

    const requests = await CollabNoteParticipationRequest.find({
      note: note._id,
      status: "pending",
    })
      .populate("requester", "name avatar headline rating totalReviews")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const decideParticipationRequest = async (req, res) => {
  try {
    const note = await CollabNote.findById(req.params.id);
    if (!note || note.archived) return res.status(404).json({ message: "Note not found" });
    if (!canManageNote(note, req.user._id)) {
      return res.status(403).json({ message: "Only the owner can manage requests" });
    }

    const action = req.params.action;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid request action" });
    }

    const participationRequest = await CollabNoteParticipationRequest.findOne({
      _id: req.params.requestId,
      note: note._id,
      status: "pending",
    });
    if (!participationRequest) {
      return res.status(404).json({ message: "Participation request not found" });
    }

    participationRequest.status = action === "approve" ? "approved" : "rejected";
    participationRequest.decidedBy = req.user._id;
    participationRequest.decidedAt = new Date();
    await participationRequest.save();

    note.participationRequestsCount = Math.max(note.participationRequestsCount - 1, 0);

    if (action === "approve") {
      const role = ["viewer", "commenter", "editor"].includes(req.body.role)
        ? req.body.role
        : participationRequest.requestedRole;
      const existing = note.collaborators.find(
        (entry) => toId(entry.user) === toId(participationRequest.requester)
      );
      if (existing) {
        existing.role = role;
      } else {
        note.collaborators.push({
          user: participationRequest.requester,
          role,
          addedBy: req.user._id,
          addedAt: new Date(),
        });
      }
      if (note.visibility === "private") note.visibility = "shared";
      await awardReputation(participationRequest.requester, "collaboration_joined", {
        collaboration: true,
      });
    }

    await note.save();

    const populatedNote = await CollabNote.findById(note._id).populate(notePopulate);

    emitNoteEvent(note._id, "note:participation:decided", {
      noteId: note._id.toString(),
      requestId: participationRequest._id.toString(),
      status: participationRequest.status,
      note: populatedNote,
    });

    await createNotification({
      recipient: participationRequest.requester,
      sender: req.user._id,
      type: "system",
      title: action === "approve" ? "Collaboration approved" : "Collaboration rejected",
      message: action === "approve"
        ? `You can now collaborate on "${note.title}"`
        : `Your request to join "${note.title}" was rejected`,
      link: `/notes/${note._id}`,
      entityType: "User",
      entityId: req.user._id,
    });

    res.status(200).json({ request: participationRequest, note: populatedNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVersions = async (req, res) => {
  try {
    const note = await findAccessibleNote(req.params.id, req.user._id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const versions = await CollabNoteVersion.find({ note: note._id })
      .populate("changedBy", "name avatar")
      .sort({ version: -1 })
      .limit(50);

    res.status(200).json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  createNote,
  deleteNote,
  deleteComment,
  decideParticipationRequest,
  getComments,
  getNoteById,
  getNotes,
  getParticipationRequests,
  getVersions,
  requestParticipation,
  toggleCommentReaction,
  toggleLikeNote,
  toggleSaveNote,
  updateComment,
  updateCollaborators,
  updateNote,
};
