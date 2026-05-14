import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Bookmark as FiBookmark,
  Check as FiCheck,
  Clock as FiClock,
  CornerDownRight as FiCornerDownRight,
  FileText as FiFileText,
  Globe as FiGlobe,
  Heart as FiHeart,
  Lock as FiLock,
  MessageSquare as FiMessageSquare,
  Pencil as FiEdit3,
  Plus as FiPlus,
  Save as FiSave,
  Search as FiSearch,
  Share2 as FiShare2,
  Star as FiStar,
  Trash2 as FiTrash2,
  Users as FiUsers,
  X as FiX,
} from "lucide-react";
import API from "../services/api";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const categories = [
  "general",
  "research",
  "project",
  "code",
  "prompt",
  "planning",
  "documentation",
];

const starterContent = `# Untitled workspace

Use this note for research, project planning, prompt libraries, code snippets, or shared documentation.

\`\`\`js
// Drop useful snippets here
const idea = "Build collaboratively";
\`\`\`
`;

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

const visibilityIcon = {
  private: <FiLock />,
  shared: <FiUsers />,
  public: <FiGlobe />,
};

const fallbackAvatar = "https://i.imgur.com/HeIi0wU.png";

const getCreator = (note) => {
  if (!note?.owner || typeof note.owner === "string") {
    return { name: "CraftLink member", avatar: fallbackAvatar };
  }

  return {
    name: note.owner.name || "CraftLink member",
    avatar: note.owner.avatar || fallbackAvatar,
    headline: note.owner.headline || "",
  };
};

const getContributorCount = (note) => {
  const collaborators = note?.collaborators?.length || 0;
  return collaborators > 0 ? collaborators + 1 : 1;
};

const CreatorBadge = ({ note, compact = false }) => {
  const creator = getCreator(note);
  const contributorCount = getContributorCount(note);

  return (
    <div style={compact ? styles.creatorCompact : styles.creatorBadge}>
      <img
        src={creator.avatar}
        alt={creator.name}
        style={compact ? styles.creatorAvatarSmall : styles.creatorAvatar}
      />
      <div style={styles.creatorCopy}>
        <span>{creator.name}</span>
        {compact ? (
          <small>
            Created {formatDate(note?.createdAt)} · Updated {formatDate(note?.updatedAt)}
            {contributorCount > 1 ? ` · ${contributorCount} contributors` : ""}
          </small>
        ) : (
          <small>
            {creator.headline ? `${creator.headline} · ` : ""}
            Created {formatDateTime(note?.createdAt)} · Updated {formatDateTime(note?.updatedAt)}
            {contributorCount > 1 ? ` · ${contributorCount} contributors` : ""}
          </small>
        )}
      </div>
    </div>
  );
};

const MarkdownPreview = ({ content }) => {
  const blocks = useMemo(() => {
    const parts = [];
    const regex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content || ""))) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", value: match[1].trim() });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < (content || "").length) {
      parts.push({ type: "text", value: content.slice(lastIndex) });
    }

    return parts.length ? parts : [{ type: "text", value: "" }];
  }, [content]);

  return (
    <div style={styles.preview}>
      {blocks.map((block, index) =>
        block.type === "code" ? (
          <pre key={index} style={styles.codeBlock}>
            <code>{block.value}</code>
          </pre>
        ) : (
          <div key={index} style={styles.markdownText}>
            {block.value.split("\n").map((line, lineIndex) => {
              if (line.startsWith("# ")) {
                return <h2 key={lineIndex} style={styles.previewH2}>{line.slice(2)}</h2>;
              }
              if (line.startsWith("## ")) {
                return <h3 key={lineIndex} style={styles.previewH3}>{line.slice(3)}</h3>;
              }
              if (line.startsWith("- ")) {
                return <p key={lineIndex} style={styles.previewList}>• {line.slice(2)}</p>;
              }
              return line.trim() ? (
                <p key={lineIndex} style={styles.previewParagraph}>{line}</p>
              ) : (
                <div key={lineIndex} style={{ height: 8 }} />
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

const NoteCard = ({ note, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...styles.noteCard,
      borderColor: active ? "var(--border-hi)" : "var(--border)",
      background: active ? "rgba(200,241,53,0.07)" : "var(--surface-1)",
    }}
  >
    <div style={styles.noteCardTop}>
      <span style={styles.categoryPill}>{note.category}</span>
      <span style={styles.visibility}>{visibilityIcon[note.visibility]} {note.visibility}</span>
    </div>
    <h3 style={styles.noteTitle}>{note.title}</h3>
    <CreatorBadge note={note} compact />
    <p style={styles.noteExcerpt}>{note.excerpt || "No preview yet."}</p>
    <div style={styles.noteMeta}>
      <span><FiMessageSquare /> {note.commentsCount || 0}</span>
      <span><FiBookmark /> {note.savesCount || 0}</span>
      <span><FiHeart /> {note.likesCount || 0}</span>
      <span><FiClock /> {formatDate(note.updatedAt)}</span>
    </div>
    {note.pinned && <span style={styles.pin}><FiStar /> pinned</span>}
  </button>
);

const CommentItem = ({
  comment,
  user,
  isOwner,
  editingCommentId,
  editingCommentBody,
  setEditingCommentId,
  setEditingCommentBody,
  onEdit,
  onDelete,
  onReply,
  onReact,
}) => {
  const isAuthor = comment.author?._id === user?._id || comment.author === user?._id;
  const reactionCount = comment.reactions?.length || 0;

  return (
    <div style={styles.commentCard}>
      <img
        src={comment.author?.avatar || "https://i.imgur.com/HeIi0wU.png"}
        alt={comment.author?.name || "User"}
        style={styles.commentAvatar}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.commentTitleRow}>
          <strong>{comment.author?.name || "User"}</strong>
          <span>{formatDate(comment.createdAt)}{comment.editedAt ? " · edited" : ""}</span>
        </div>

        {editingCommentId === comment._id ? (
          <div style={styles.commentEditBox}>
            <input
              value={editingCommentBody}
              onChange={(event) => setEditingCommentBody(event.target.value)}
            />
            <button type="button" className="secondary-btn" onClick={() => onEdit(comment)}>
              Save
            </button>
            <button type="button" className="secondary-btn" onClick={() => setEditingCommentId("")}>
              Cancel
            </button>
          </div>
        ) : (
          <p>{comment.body}</p>
        )}

        <div style={styles.commentActions}>
          <button type="button" style={styles.linkAction} onClick={() => onReact(comment)}>
            <FiHeart /> {reactionCount}
          </button>
          <button type="button" style={styles.linkAction} onClick={() => onReply(comment)}>
            Reply
          </button>
          {isAuthor && (
            <button
              type="button"
              style={styles.linkAction}
              onClick={() => {
                setEditingCommentId(comment._id);
                setEditingCommentBody(comment.body);
              }}
            >
              Edit
            </button>
          )}
          {(isAuthor || isOwner) && (
            <button type="button" style={styles.linkAction} onClick={() => onDelete(comment)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Notes = () => {
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(window.location.search).get("note") || "");
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [comments, setComments] = useState([]);
  const [scope, setScope] = useState("mine");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [participationRequests, setParticipationRequests] = useState([]);
  const [presence, setPresence] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    visibility: "private",
    category: "general",
    tags: "",
    pinned: false,
  });

  const draftTimer = useRef(null);
  const selectedNote = selectedPayload?.note || null;
  const isOwner = selectedNote?.owner?._id === user?._id || selectedNote?.owner === user?._id;
  const myCollaboratorRole = selectedNote?.collaborators?.find(
    (entry) => (entry.user?._id || entry.user) === user?._id
  )?.role;
  const canEditNote = isOwner || myCollaboratorRole === "editor";
  const canCommentNote = isOwner || ["commenter", "editor"].includes(myCollaboratorRole) || selectedNote?.visibility === "public";
  const canRequestAccess = selectedNote && !isOwner && !myCollaboratorRole && !selectedPayload?.participationRequest;

  const loadNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await API.get("/notes", {
        ...authHeaders(token),
        params: { scope, q: search },
      });
      setNotes(data);
      if (!selectedId && data[0]?._id) setSelectedId(data[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [scope, search, selectedId, token]);

  const loadSelectedNote = useCallback(async () => {
    if (!token || !selectedId) {
      setSelectedPayload(null);
      setComments([]);
      return;
    }

    try {
      const [{ data: noteData }, { data: commentData }] = await Promise.all([
        API.get(`/notes/${selectedId}`, authHeaders(token)),
        API.get(`/notes/${selectedId}/comments`, authHeaders(token)),
      ]);
      setSelectedPayload(noteData);
      setComments(commentData);
      setForm({
        title: noteData.note.title || "",
        content: noteData.note.content || "",
        visibility: noteData.note.visibility || "private",
        category: noteData.note.category || "general",
        tags: (noteData.note.tags || []).join(", "),
        pinned: Boolean(noteData.note.pinned),
      });
      if (noteData.note.owner?._id === user?._id || noteData.note.owner === user?._id) {
        const { data: requestsData } = await API.get(
          `/notes/${selectedId}/participation`,
          authHeaders(token)
        );
        setParticipationRequests(requestsData);
      } else {
        setParticipationRequests([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to open note");
    }
  }, [selectedId, token, user?._id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    loadSelectedNote();
  }, [loadSelectedNote]);

  useEffect(() => {
    if (!selectedId || !user?._id) return;

    const currentUser = { _id: user._id, name: user.name, avatar: user.avatar };
    const handleUpdated = ({ note, editedBy }) => {
      if (!note || note._id !== selectedId) return;
      setSelectedPayload((prev) => ({ ...(prev || {}), note }));
      setNotes((prev) => prev.map((item) => (item._id === note._id ? note : item)));
      if (editedBy?._id !== user._id) {
        setForm({
          title: note.title || "",
          content: note.content || "",
          visibility: note.visibility || "private",
          category: note.category || "general",
          tags: (note.tags || []).join(", "),
          pinned: Boolean(note.pinned),
        });
        toast.success(`${editedBy?.name || "A collaborator"} updated this note`);
      }
    };
    const handleComment = ({ comment }) => {
      if (!comment) return;
      setComments((prev) => {
        if (prev.some((item) => item._id === comment._id)) return prev;
        setNotes((currentNotes) =>
          currentNotes.map((item) =>
            item._id === selectedId
              ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
              : item
          )
        );
        return [comment, ...prev];
      });
    };
    const handleArchived = ({ noteId }) => {
      if (noteId !== selectedId) return;
      setNotes((prev) => prev.filter((item) => item._id !== noteId));
      setSelectedId("");
      setSelectedPayload(null);
      toast("This note was deleted");
    };
    const handleLiked = ({ noteId, liked, likesCount, userId }) => {
      if (noteId !== selectedId) return;
      setSelectedPayload((prev) => ({
        ...(prev || {}),
        liked: userId === user._id ? liked : prev?.liked,
        note: prev?.note ? { ...prev.note, likesCount } : prev?.note,
      }));
      setNotes((prev) =>
        prev.map((item) => (item._id === noteId ? { ...item, likesCount } : item))
      );
    };
    const handleCommentUpdated = ({ comment }) => {
      if (!comment) return;
      setComments((prev) => prev.map((item) => (item._id === comment._id ? comment : item)));
    };
    const handleCommentDeleted = ({ commentId }) => {
      setComments((prev) => prev.filter((item) => item._id !== commentId && item.parent !== commentId));
    };
    const handleParticipationRequested = ({ request }) => {
      if (!request || !isOwner) return;
      setParticipationRequests((prev) => (
        prev.some((item) => item._id === request._id) ? prev : [request, ...prev]
      ));
    };
    const handleParticipationDecided = ({ requestId, note }) => {
      setParticipationRequests((prev) => prev.filter((item) => item._id !== requestId));
      if (note) {
        setSelectedPayload((prev) => ({ ...(prev || {}), note }));
        setNotes((prev) => prev.map((item) => (item._id === note._id ? note : item)));
      }
    };
    const handlePresence = ({ user: activeUser, status }) => {
      if (!activeUser?._id || activeUser._id === user._id) return;
      setPresence((prev) => {
        const next = prev.filter((item) => item._id !== activeUser._id);
        return status === "joined" ? [...next, activeUser] : next;
      });
    };
    const handleDraft = ({ user: editor }) => {
      if (!editor?._id || editor._id === user._id) return;
      setPresence((prev) => {
        const exists = prev.some((item) => item._id === editor._id);
        return exists ? prev : [...prev, editor];
      });
    };

    socket.emit("note:join", { noteId: selectedId, user: currentUser });
    socket.on("note:updated", handleUpdated);
    socket.on("note:comment", handleComment);
    socket.on("note:presence", handlePresence);
    socket.on("note:draft", handleDraft);
    socket.on("note:archived", handleArchived);
    socket.on("note:liked", handleLiked);
    socket.on("note:comment:updated", handleCommentUpdated);
    socket.on("note:comment:reaction", handleCommentUpdated);
    socket.on("note:comment:deleted", handleCommentDeleted);
    socket.on("note:participation:requested", handleParticipationRequested);
    socket.on("note:participation:decided", handleParticipationDecided);

    return () => {
      socket.emit("note:leave", { noteId: selectedId, user: currentUser });
      socket.off("note:updated", handleUpdated);
      socket.off("note:comment", handleComment);
      socket.off("note:presence", handlePresence);
      socket.off("note:draft", handleDraft);
      socket.off("note:archived", handleArchived);
      socket.off("note:liked", handleLiked);
      socket.off("note:comment:updated", handleCommentUpdated);
      socket.off("note:comment:reaction", handleCommentUpdated);
      socket.off("note:comment:deleted", handleCommentDeleted);
      socket.off("note:participation:requested", handleParticipationRequested);
      socket.off("note:participation:decided", handleParticipationDecided);
      setPresence([]);
    };
  }, [isOwner, selectedId, user?._id, user?.avatar, user?.name]);

  const createNote = async () => {
    try {
      const { data } = await API.post(
        "/notes",
        {
          title: "New collaboration note",
          content: starterContent,
          category: "planning",
          visibility: "private",
        },
        authHeaders(token)
      );
      setNotes((prev) => [data, ...prev]);
      setSelectedId(data._id);
      setScope("mine");
      toast.success("Note created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create note");
    }
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const { data } = await API.put(
        `/notes/${selectedNote._id}`,
        {
          title: form.title,
          content: form.content,
          visibility: form.visibility,
          category: form.category,
          pinned: form.pinned,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          changeSummary: "Workspace edit",
        },
        authHeaders(token)
      );
      setSelectedPayload((prev) => ({ ...(prev || {}), note: data }));
      setNotes((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      toast.success("Note saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!selectedNote || !window.confirm("Delete this note from your workspace?")) return;

    setDeleting(true);
    try {
      await API.delete(`/notes/${selectedNote._id}`, authHeaders(token));
      setNotes((prev) => {
        const next = prev.filter((item) => item._id !== selectedNote._id);
        setSelectedId(next[0]?._id || "");
        return next;
      });
      setSelectedPayload(null);
      setComments([]);
      toast.success("Note deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  const shareNote = async () => {
    if (!selectedNote) return;

    const query = window.prompt("Search collaborator by name or skill");
    if (!query?.trim()) return;

    try {
      const { data: users } = await API.get("/users/search", {
        params: { q: query.trim() },
      });
      const collaborator = users.find((item) => item._id !== user._id);
      if (!collaborator) {
        toast.error("No matching user found");
        return;
      }

      const role = window.prompt("Role: viewer, commenter, or editor", "editor") || "editor";
      const safeRole = ["viewer", "commenter", "editor"].includes(role)
        ? role
        : "editor";

      const existing = selectedNote.collaborators || [];
      const collaborators = [
        ...existing
          .filter((entry) => (entry.user?._id || entry.user) !== collaborator._id)
          .map((entry) => ({
            user: entry.user?._id || entry.user,
            role: entry.role || "viewer",
          })),
        { user: collaborator._id, role: safeRole },
      ];

      const { data } = await API.put(
        `/notes/${selectedNote._id}/collaborators`,
        { collaborators },
        authHeaders(token)
      );

      setSelectedPayload((prev) => ({ ...(prev || {}), note: data }));
      setNotes((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setForm((prev) => ({ ...prev, visibility: data.visibility }));
      toast.success(`Shared with ${collaborator.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share note");
    }
  };

  const copyShareLink = async () => {
    if (!selectedNote) return;
    const link = `${window.location.origin}/notes`;
    await navigator.clipboard?.writeText(`${link}?note=${selectedNote._id}`);
    toast.success("Share link copied");
  };

  const updateDraft = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (selectedId && user?._id) {
        socket.emit("note:draft", {
          noteId: selectedId,
          user: { _id: user._id, name: user.name, avatar: user.avatar },
          title: next.title,
          content: next.content,
        });
      }
    }, 350);
  };

  const toggleSave = async () => {
    if (!selectedNote) return;
    try {
      const { data } = await API.post(`/notes/${selectedNote._id}/save`, {}, authHeaders(token));
      setSelectedPayload((prev) => ({ ...prev, saved: data.saved }));
      setNotes((prev) =>
        prev.map((item) =>
          item._id === selectedNote._id
            ? { ...item, savesCount: data.savesCount ?? item.savesCount }
            : item
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bookmark");
    }
  };

  const toggleLike = async () => {
    if (!selectedNote) return;
    try {
      const { data } = await API.post(`/notes/${selectedNote._id}/like`, {}, authHeaders(token));
      setSelectedPayload((prev) => ({
        ...prev,
        liked: data.liked,
        note: { ...prev.note, likesCount: data.likesCount ?? prev.note.likesCount },
      }));
      setNotes((prev) =>
        prev.map((item) =>
          item._id === selectedNote._id
            ? { ...item, likesCount: data.likesCount ?? item.likesCount }
            : item
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update like");
    }
  };

  const requestParticipation = async () => {
    if (!selectedNote) return;
    const message = window.prompt("Add a short message for the owner", "I would like to collaborate on this note.");
    if (message === null) return;
    try {
      const { data } = await API.post(
        `/notes/${selectedNote._id}/participation`,
        { message, requestedRole: "editor" },
        authHeaders(token)
      );
      setSelectedPayload((prev) => ({ ...prev, participationRequest: data }));
      toast.success("Collaboration request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request access");
    }
  };

  const decideParticipation = async (requestId, action, role = "editor") => {
    if (!selectedNote) return;
    try {
      const { data } = await API.put(
        `/notes/${selectedNote._id}/participation/${requestId}/${action}`,
        { role },
        authHeaders(token)
      );
      setParticipationRequests((prev) => prev.filter((item) => item._id !== requestId));
      setSelectedPayload((prev) => ({ ...prev, note: data.note }));
      setNotes((prev) => prev.map((item) => (item._id === data.note._id ? data.note : item)));
      toast.success(action === "approve" ? "Request approved" : "Request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update request");
    }
  };

  const addComment = async () => {
    const body = commentBody.trim();
    if (!selectedNote || !body) return;

    try {
      const { data } = await API.post(
        `/notes/${selectedNote._id}/comments`,
        { body, parent: replyTo?._id || null },
        authHeaders(token)
      );
      setComments((prev) => (
        prev.some((item) => item._id === data._id) ? prev : [data, ...prev]
      ));
      setNotes((prev) =>
        prev.map((item) =>
          item._id === selectedNote._id
            ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
            : item
        )
      );
      setCommentBody("");
      setReplyTo(null);
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to comment");
    }
  };

  const editComment = async (comment) => {
    const body = editingCommentBody.trim();
    if (!body) return;
    try {
      const { data } = await API.put(
        `/notes/comments/${comment._id}`,
        { body },
        authHeaders(token)
      );
      setComments((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setEditingCommentId("");
      setEditingCommentBody("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit comment");
    }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/notes/comments/${comment._id}`, authHeaders(token));
      setComments((prev) => prev.filter((item) => item._id !== comment._id && item.parent !== comment._id));
      setNotes((prev) =>
        prev.map((item) =>
          item._id === selectedNote._id
            ? { ...item, commentsCount: Math.max((item.commentsCount || 0) - 1, 0) }
            : item
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const reactToComment = async (comment) => {
    try {
      const { data } = await API.post(
        `/notes/comments/${comment._id}/reactions`,
        { type: "like" },
        authHeaders(token)
      );
      setComments((prev) => prev.map((item) => (item._id === data._id ? data : item)));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to react");
    }
  };

  const rootComments = comments.filter((comment) => !comment.parent);
  const repliesByParent = comments.reduce((map, comment) => {
    if (!comment.parent) return map;
    const parentId = comment.parent?._id || comment.parent;
    map[parentId] = [...(map[parentId] || []), comment];
    return map;
  }, {});

  return (
    <section className="section">
      <div className="container">
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Collaboration</p>
            <h1 style={{ marginBottom: "0.6rem" }}>Shared Notes</h1>
            <p style={styles.headerCopy}>
              Plan projects, capture research, store code snippets, and collaborate in realtime.
            </p>
          </div>
          <button className="primary-btn" onClick={createNote}>
            <FiPlus /> New note
          </button>
        </div>

        <div style={styles.workspace}>
          <aside className="glass" style={styles.sidebar}>
            <div style={styles.searchBox}>
              <FiSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes..."
                style={styles.searchInput}
              />
            </div>

            <div style={styles.scopes}>
              {["mine", "shared", "saved", "public", "trending"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  style={{
                    ...styles.scopeButton,
                    background: scope === value ? "var(--lime)" : "transparent",
                    color: scope === value ? "var(--ink)" : "var(--muted)",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>

            <div style={styles.noteList}>
              {loading ? (
                [1, 2, 3].map((item) => (
                  <div key={item} className="skeleton" style={styles.noteSkeleton} />
                ))
              ) : notes.length === 0 ? (
                <div style={styles.emptyList}>
                  <FiFileText size={28} />
                  <p>No notes yet.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    active={selectedId === note._id}
                    onClick={() => setSelectedId(note._id)}
                  />
                ))
              )}
            </div>
          </aside>

          <main className="glass" style={styles.editorPanel}>
            {!selectedNote ? (
              <div style={styles.emptyEditor}>
                <FiEdit3 size={36} />
                <h3>Select or create a note</h3>
                <p>Notes you own, save, or collaborate on will open here.</p>
              </div>
            ) : (
              <>
                <div style={styles.editorTop}>
                  <div style={styles.titleGroup}>
                    <input
                      value={form.title}
                      onChange={(event) => updateDraft({ title: event.target.value })}
                      style={styles.titleInput}
                      readOnly={!canEditNote}
                    />
                    <div style={styles.statusLine}>
                      <CreatorBadge note={selectedNote} />
                      <span>{visibilityIcon[form.visibility]} {form.visibility}</span>
                      <span><FiClock /> v{selectedNote.currentVersion}</span>
                      <span><FiMessageSquare /> {comments.length} comments</span>
                      {presence.length > 0 && <span><FiUsers /> {presence.map((item) => item.name).join(", ")} active</span>}
                    </div>
                  </div>
                  <div style={styles.editorActions}>
                    <button
                      className="secondary-btn"
                      style={styles.smallButton}
                      onClick={toggleLike}
                    >
                      <FiHeart /> {selectedPayload.liked ? "Liked" : "Like"} ({selectedNote.likesCount || 0})
                    </button>
                    <button className="secondary-btn" style={styles.smallButton} onClick={copyShareLink}>
                      <FiShare2 /> Copy link
                    </button>
                    {canRequestAccess && (
                      <button className="secondary-btn" style={styles.smallButton} onClick={requestParticipation}>
                        <FiUsers /> Request access
                      </button>
                    )}
                    {selectedPayload.participationRequest && (
                      <button className="secondary-btn" style={styles.smallButton} disabled>
                        <FiClock /> Request pending
                      </button>
                    )}
                    {selectedNote && (
                      <button className="secondary-btn" style={styles.smallButton} onClick={shareNote}>
                        <FiShare2 /> Share
                      </button>
                    )}
                    <button className="secondary-btn" style={styles.smallButton} onClick={toggleSave}>
                      <FiBookmark /> {selectedPayload.saved ? "Saved" : "Save"}
                    </button>
                    {isOwner && (
                      <button className="secondary-btn" style={styles.smallButton} onClick={deleteNote} disabled={deleting}>
                        <FiTrash2 /> {deleting ? "Deleting..." : "Delete"}
                      </button>
                    )}
                    <button className="primary-btn" style={styles.smallButton} onClick={saveNote} disabled={saving || !canEditNote}>
                      <FiSave /> {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>

                {isOwner && participationRequests.length > 0 && (
                  <div style={styles.requestsPanel}>
                    <div style={styles.commentsHeader}>
                      <h3>Participation Requests</h3>
                      <span>{participationRequests.length}</span>
                    </div>
                    <div style={styles.commentsList}>
                      {participationRequests.map((request) => (
                        <div key={request._id} style={styles.commentCard}>
                          <img
                            src={request.requester?.avatar || "https://i.imgur.com/HeIi0wU.png"}
                            alt={request.requester?.name || "User"}
                            style={styles.commentAvatar}
                          />
                          <div style={{ flex: 1 }}>
                            <strong>{request.requester?.name || "User"}</strong>
                            <p>{request.message || `Requested ${request.requestedRole} access.`}</p>
                            <div style={styles.commentActions}>
                              <button type="button" style={styles.linkAction} onClick={() => decideParticipation(request._id, "approve", request.requestedRole)}>
                                <FiCheck /> Approve
                              </button>
                              <button type="button" style={styles.linkAction} onClick={() => decideParticipation(request._id, "reject")}>
                                <FiX /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.metaGrid}>
                  <label style={styles.fieldLabel}>
                    Visibility
                    <select
                      value={form.visibility}
                      onChange={(event) => updateDraft({ visibility: event.target.value })}
                      disabled={!isOwner}
                    >
                      <option value="private">Private</option>
                      <option value="shared">Shared</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                  <label style={styles.fieldLabel}>
                    Category
                    <select
                      value={form.category}
                      onChange={(event) => updateDraft({ category: event.target.value })}
                      disabled={!canEditNote}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label style={styles.fieldLabel}>
                    Tags
                    <input
                      value={form.tags}
                      onChange={(event) => updateDraft({ tags: event.target.value })}
                      placeholder="react, research, ui"
                      disabled={!canEditNote}
                    />
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(event) => updateDraft({ pinned: event.target.checked })}
                      disabled={!canEditNote}
                    />
                    Pin note
                  </label>
                </div>

                <div style={styles.editorGrid}>
                  <textarea
                    value={form.content}
                    onChange={(event) => updateDraft({ content: event.target.value })}
                    style={styles.textarea}
                    spellCheck="false"
                    readOnly={!canEditNote}
                  />
                  <MarkdownPreview content={form.content} />
                </div>

                <div style={styles.commentsPanel}>
                  <div style={styles.commentsHeader}>
                    <h3>Collaboration Comments</h3>
                    <span>{comments.length}</span>
                  </div>
                  <div style={styles.commentInputRow}>
                    <input
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      placeholder={replyTo ? `Reply to ${replyTo.author?.name || "comment"}...` : "Add a comment or review note..."}
                      disabled={!canCommentNote}
                    />
                    {replyTo && (
                      <button className="secondary-btn" onClick={() => setReplyTo(null)}>Cancel</button>
                    )}
                    <button className="secondary-btn" onClick={addComment} disabled={!canCommentNote}>Comment</button>
                  </div>
                  <div style={styles.commentsList}>
                    {comments.length === 0 ? (
                      <p style={styles.muted}>No comments yet.</p>
                    ) : (
                      rootComments.map((comment) => (
                        <div key={comment._id} style={styles.commentThread}>
                          <CommentItem
                            comment={comment}
                            user={user}
                            isOwner={isOwner}
                            editingCommentId={editingCommentId}
                            editingCommentBody={editingCommentBody}
                            setEditingCommentId={setEditingCommentId}
                            setEditingCommentBody={setEditingCommentBody}
                            onEdit={editComment}
                            onDelete={deleteComment}
                            onReply={setReplyTo}
                            onReact={reactToComment}
                          />
                          {(repliesByParent[comment._id] || []).map((reply) => (
                            <div key={reply._id} style={styles.replyWrap}>
                              <FiCornerDownRight style={{ color: "var(--muted)", flexShrink: 0, marginTop: 14 }} />
                              <CommentItem
                                comment={reply}
                                user={user}
                                isOwner={isOwner}
                                editingCommentId={editingCommentId}
                                editingCommentBody={editingCommentBody}
                                setEditingCommentId={setEditingCommentId}
                                setEditingCommentBody={setEditingCommentBody}
                                onEdit={editComment}
                                onDelete={deleteComment}
                                onReply={setReplyTo}
                                onReact={reactToComment}
                              />
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--muted)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.55rem",
  },
  headerCopy: {
    color: "var(--off-white)",
    maxWidth: 680,
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
    gap: "1.2rem",
    alignItems: "start",
  },
  sidebar: {
    padding: "1rem",
    position: "sticky",
    top: 88,
    maxHeight: "calc(100vh - 110px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "0 0.8rem",
    marginBottom: "0.75rem",
    color: "var(--muted)",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    paddingInline: 0,
  },
  scopes: {
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap",
    marginBottom: "0.8rem",
  },
  scopeButton: {
    borderRadius: "var(--r-sm)",
    padding: "0.42rem 0.7rem",
    fontSize: "0.76rem",
    fontWeight: 800,
    textTransform: "capitalize",
  },
  noteList: {
    display: "grid",
    gap: "0.75rem",
    overflowY: "auto",
    paddingRight: "0.2rem",
  },
  noteCard: {
    position: "relative",
    textAlign: "left",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "1rem",
    color: "inherit",
    transition: "border-color var(--t-fast), background var(--t-fast)",
  },
  noteCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "0.65rem",
  },
  categoryPill: {
    color: "var(--lime)",
    background: "var(--lime-dim)",
    border: "1px solid rgba(200,241,53,0.18)",
    borderRadius: "var(--r-full)",
    padding: "0.18rem 0.55rem",
    fontSize: "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  visibility: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    color: "var(--muted)",
    fontSize: "0.72rem",
    textTransform: "capitalize",
  },
  noteTitle: {
    fontSize: "0.98rem",
    marginBottom: "0.4rem",
  },
  noteExcerpt: {
    color: "var(--off-white)",
    fontSize: "0.82rem",
    lineHeight: 1.55,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 42,
  },
  creatorCompact: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    marginBottom: "0.55rem",
    color: "var(--muted)",
    fontSize: "0.76rem",
    fontWeight: 700,
  },
  creatorBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "var(--off-white)",
  },
  creatorAvatarSmall: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--border)",
  },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--border-hi)",
  },
  creatorCopy: {
    display: "grid",
    gap: 1,
    minWidth: 0,
  },
  creatorCopySmall: {
    color: "var(--muted)",
  },
  noteMeta: {
    display: "flex",
    gap: "0.7rem",
    flexWrap: "wrap",
    marginTop: "0.8rem",
    color: "var(--muted)",
    fontSize: "0.72rem",
  },
  pin: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: "0.65rem",
    color: "var(--lime)",
    fontSize: "0.72rem",
  },
  noteSkeleton: {
    height: 138,
    borderRadius: "var(--r-md)",
  },
  emptyList: {
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
    gap: "0.5rem",
  },
  editorPanel: {
    padding: "1.2rem",
    minWidth: 0,
  },
  emptyEditor: {
    minHeight: 520,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
    gap: "0.7rem",
    textAlign: "center",
  },
  editorTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  titleGroup: {
    flex: 1,
    minWidth: 240,
  },
  titleInput: {
    border: "none",
    background: "transparent",
    padding: 0,
    borderRadius: 0,
    fontFamily: "var(--font-display)",
    fontSize: "1.7rem",
    fontWeight: 800,
  },
  statusLine: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
    marginTop: "0.45rem",
    color: "var(--muted)",
    fontSize: "0.78rem",
  },
  editorActions: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  smallButton: {
    padding: "0.58rem 0.9rem",
    fontSize: "0.8rem",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "0.8rem",
    marginBottom: "1rem",
  },
  fieldLabel: {
    display: "grid",
    gap: "0.35rem",
    color: "var(--muted)",
    fontSize: "0.76rem",
    fontWeight: 800,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "var(--off-white)",
    fontSize: "0.84rem",
    paddingTop: "1.35rem",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "1rem",
  },
  textarea: {
    minHeight: 460,
    resize: "vertical",
    fontFamily: "var(--font-mono)",
    fontSize: "0.86rem",
    lineHeight: 1.7,
  },
  preview: {
    minHeight: 460,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "1rem",
    overflow: "auto",
  },
  markdownText: {
    color: "var(--off-white)",
  },
  previewH2: {
    fontSize: "1.35rem",
    marginBottom: "0.7rem",
  },
  previewH3: {
    fontSize: "1.05rem",
    marginBottom: "0.55rem",
  },
  previewParagraph: {
    marginBottom: "0.65rem",
    fontSize: "0.9rem",
  },
  previewList: {
    marginBottom: "0.35rem",
    paddingLeft: "0.4rem",
    fontSize: "0.9rem",
  },
  codeBlock: {
    background: "#070707",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "0.9rem",
    color: "var(--lime)",
    overflowX: "auto",
    fontSize: "0.82rem",
    lineHeight: 1.65,
    margin: "0.8rem 0",
  },
  commentsPanel: {
    marginTop: "1rem",
    borderTop: "1px solid var(--border)",
    paddingTop: "1rem",
  },
  requestsPanel: {
    marginBottom: "1rem",
    padding: "1rem",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    background: "var(--surface-2)",
  },
  commentsHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  },
  commentInputRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.7rem",
    marginBottom: "1rem",
  },
  commentsList: {
    display: "grid",
    gap: "0.75rem",
  },
  commentThread: {
    display: "grid",
    gap: "0.55rem",
  },
  replyWrap: {
    display: "flex",
    gap: "0.55rem",
    marginLeft: "1rem",
  },
  commentCard: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.85rem",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    background: "var(--surface-2)",
  },
  commentTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    color: "var(--off-white)",
    fontSize: "0.84rem",
  },
  commentActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.65rem",
    marginTop: "0.55rem",
  },
  linkAction: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    color: "var(--muted)",
    border: "none",
    padding: 0,
    fontSize: "0.76rem",
  },
  commentEditBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
  },
  muted: {
    color: "var(--muted)",
    fontSize: "0.88rem",
  },
};

export default Notes;
