const CollabNote = require("../models/CollabNote");

const toId = (value) => value?._id?.toString?.() || value?.toString?.() || "";

const getCollaboratorRole = (note, userId) => {
  const collaborator = note.collaborators?.find(
    (entry) => toId(entry.user) === toId(userId)
  );
  return collaborator?.role || null;
};

const canViewNote = (note, userId) => {
  if (!note || note.archived) return false;
  if (note.visibility === "public") return true;
  if (!userId) return false;
  if (toId(note.owner) === toId(userId)) return true;
  return Boolean(getCollaboratorRole(note, userId));
};

const canCommentNote = (note, userId) => {
  if (!canViewNote(note, userId)) return false;
  if (note.visibility === "public" && userId) return true;
  if (toId(note.owner) === toId(userId)) return true;
  return ["commenter", "editor"].includes(getCollaboratorRole(note, userId));
};

const canEditNote = (note, userId) => {
  if (!note || !userId || note.archived) return false;
  if (toId(note.owner) === toId(userId)) return true;
  return getCollaboratorRole(note, userId) === "editor";
};

const canManageNote = (note, userId) => {
  return Boolean(note && userId && toId(note.owner) === toId(userId));
};

const canShareNote = (note, userId) => {
  return canViewNote(note, userId);
};

const makeExcerpt = (content = "") => {
  return content
    .replace(/```[\s\S]*?```/g, " code snippet ")
    .replace(/[#>*_`[\]()~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
};

const sanitizeTags = (tags = []) => {
  return [...new Set(
    tags
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12)
  )];
};

const emitNoteEvent = (noteId, eventName, payload) => {
  if (!global.io || !noteId) return;
  global.io.to(`note:${noteId}`).emit(eventName, payload);
};

const findAccessibleNote = async (noteId, userId) => {
  const note = await CollabNote.findById(noteId);
  if (!note || !canViewNote(note, userId)) return null;
  return note;
};

module.exports = {
  canViewNote,
  canCommentNote,
  canEditNote,
  canManageNote,
  canShareNote,
  emitNoteEvent,
  findAccessibleNote,
  getCollaboratorRole,
  makeExcerpt,
  sanitizeTags,
  toId,
};
