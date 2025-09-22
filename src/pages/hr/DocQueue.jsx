import { useEffect, useState } from "react";
import { getPendingDocs, reviewDoc } from "../../services/documentService";
import StatusBadge from "../../components/common/StatusBadge";

export default function DocQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setItems(await getPendingDocs());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function onAction(id, action) {
    const note = action === "REJECT" ? prompt("Lý do từ chối?") : "";
    await reviewDoc(id, action, note);
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        Hồ sơ chờ duyệt
      </h1>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflowX: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead>
            <tr style={{ background: "#f6f6f6", textAlign: "left" }}>
              <Th>Tài liệu</Th>
              <Th>Tên file</Th>
              <Th>Ngày nộp</Th>
              <Th>Trạng thái</Th>
              <Th>Ghi chú</Th>
              <Th style={{ width: 200 }}>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: 12 }}>
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                  Không có hồ sơ chờ duyệt.
                </td>
              </tr>
            )}
            {items.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid #eee" }}>
                <Td>{d.type}</Td>
                <Td>{d.fileName}</Td>
                <Td>{new Date(d.uploadedAt).toLocaleDateString()}</Td>
                <Td>
                  <StatusBadge status={d.status} />
                </Td>
                <Td>{d.note || "-"}</Td>
                <Td>
                  <button onClick={() => onAction(d.id, "APPROVE")} style={btn}>
                    Duyệt
                  </button>{" "}
                  <button
                    onClick={() => onAction(d.id, "REJECT")}
                    style={{
                      ...btn,
                      background: "#fff",
                      color: "#c53030",
                      border: "1px solid #f0b3b3",
                    }}
                  >
                    Từ chối
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const Th = ({ children }) => <th style={{ padding: 12 }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: 12 }}>{children}</td>;
const btn = {
  padding: "6px 10px",
  borderRadius: 8,
  border: 0,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};
