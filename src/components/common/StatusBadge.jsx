export default function StatusBadge({ status = "PENDING" }) {
  const map = {
    PENDING: { bg: "#fff8e1", color: "#8a6a00", text: "Đang duyệt" },
    APPROVED: { bg: "#e6ffed", color: "#1a7f37", text: "Đã duyệt" },
    REJECTED: { bg: "#ffeaea", color: "#c53030", text: "Từ chối" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      {s.text}
    </span>
  );
}
