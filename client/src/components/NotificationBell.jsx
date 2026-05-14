import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, MessageCircle, ShoppingBag } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const typeIcon = {
  message: <MessageCircle size={16} strokeWidth={2} />,
  request: <ShoppingBag size={16} strokeWidth={2} />,
  request_accepted: <Check size={16} strokeWidth={2} />,
  request_rejected: <Check size={16} strokeWidth={2} />,
  request_completed: <Check size={16} strokeWidth={2} />,
  system: <Bell size={16} strokeWidth={2} />,
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Now";
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  return `${Math.floor(diff / day)}d`;
};

const NotificationBell = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const badgeLabel = useMemo(() => {
    if (unreadCount > 99) return "99+";
    return unreadCount.toString();
  }, [unreadCount]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleItemClick = (notification) => {
    if (!notification.read) markAsRead(notification._id);
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={rootRef} style={styles.root}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={styles.button}
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && <span style={styles.badge}>{badgeLabel}</span>}
      </button>

      {open && (
        <div style={styles.panel} className="anim-scale">
          <div style={styles.header}>
            <div>
              <p style={styles.title}>Notifications</p>
              <span style={styles.subtitle}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </span>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                ...styles.markAll,
                opacity: unreadCount === 0 ? 0.45 : 1,
                cursor: unreadCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              Mark all
            </button>
          </div>

          <div style={styles.list}>
            {loading ? (
              <div style={styles.empty}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.link || "#"}
                  onClick={() => handleItemClick(notification)}
                  style={{
                    ...styles.item,
                    background: notification.read
                      ? "transparent"
                      : "rgba(200,241,53,0.07)",
                  }}
                >
                  <span style={styles.icon}>
                    {typeIcon[notification.type] || typeIcon.system}
                  </span>
                  <span style={styles.content}>
                    <span style={styles.itemTitle}>{notification.title}</span>
                    <span style={styles.message}>{notification.message}</span>
                    <span style={styles.time}>{timeAgo(notification.createdAt)}</span>
                  </span>
                  {!notification.read && <span style={styles.unreadDot} />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  root: {
    position: "relative",
    display: "inline-flex",
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "rgba(248,246,242,0.04)",
    color: "var(--off-white)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transition: "background var(--t-fast), color var(--t-fast), border-color var(--t-fast)",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    borderRadius: "var(--r-full)",
    background: "var(--lime)",
    color: "var(--ink)",
    border: "2px solid var(--surface-0)",
    fontSize: "0.66rem",
    fontWeight: 800,
    lineHeight: "14px",
    textAlign: "center",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 0.75rem)",
    right: 0,
    width: "min(360px, calc(100vw - 2rem))",
    maxHeight: "min(460px, calc(100vh - 6rem))",
    overflow: "hidden",
    background: "rgba(17,17,17,0.98)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    boxShadow: "var(--shadow-lg)",
    backdropFilter: "blur(18px)",
    zIndex: 1100,
  },
  header: {
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: "1px solid var(--border)",
  },
  title: {
    margin: 0,
    fontSize: "0.92rem",
    fontWeight: 800,
    color: "var(--white)",
    lineHeight: 1.2,
  },
  subtitle: {
    display: "block",
    marginTop: 3,
    fontSize: "0.75rem",
    color: "var(--muted)",
  },
  markAll: {
    alignSelf: "center",
    background: "transparent",
    color: "var(--lime)",
    fontSize: "0.75rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  list: {
    maxHeight: 380,
    overflowY: "auto",
    padding: "0.35rem",
  },
  item: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "34px 1fr 8px",
    gap: "0.7rem",
    padding: "0.8rem",
    borderRadius: "var(--r-md)",
    color: "inherit",
    transition: "background var(--t-fast)",
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: "var(--r-sm)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(99,102,241,0.12)",
    color: "#a5b4fc",
  },
  content: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  itemTitle: {
    fontSize: "0.84rem",
    color: "var(--white)",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  message: {
    fontSize: "0.78rem",
    color: "var(--off-white)",
    lineHeight: 1.45,
  },
  time: {
    fontSize: "0.7rem",
    color: "var(--muted)",
    marginTop: 3,
  },
  unreadDot: {
    width: 7,
    height: 7,
    alignSelf: "center",
    borderRadius: "50%",
    background: "var(--lime)",
    boxShadow: "0 0 12px var(--lime-glow)",
  },
  empty: {
    padding: "2.4rem 1rem",
    textAlign: "center",
    color: "var(--muted)",
    fontSize: "0.85rem",
  },
};

export default NotificationBell;
