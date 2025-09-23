import "./StatusBadge.css";

export default function StatusBadge({ status = "PENDING" }) {
  // Map trạng thái sang text và class
  const map = {
    PENDING: { class: "pending", text: "Đang duyệt" },
    APPROVED: { class: "active", text: "Đã duyệt" },
    REJECTED: { class: "inactive", text: "Từ chối" },
  };
  const s = map[status] || map.PENDING;
  return <span className={`status-badge ${s.class}`}>{s.text}</span>;
}
