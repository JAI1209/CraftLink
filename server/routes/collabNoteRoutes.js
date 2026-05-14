const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/collabNoteController");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getNotes)
  .post(createNote);

router.route("/:id")
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.put("/:id/collaborators", updateCollaborators);
router.post("/:id/like", toggleLikeNote);
router.post("/:id/participation", requestParticipation);
router.get("/:id/participation", getParticipationRequests);
router.put("/:id/participation/:requestId/:action", decideParticipationRequest);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);
router.put("/comments/:commentId", updateComment);
router.delete("/comments/:commentId", deleteComment);
router.post("/comments/:commentId/reactions", toggleCommentReaction);
router.post("/:id/save", toggleSaveNote);
router.get("/:id/versions", getVersions);

module.exports = router;
