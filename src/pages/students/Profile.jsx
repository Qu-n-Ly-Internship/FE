import { useEffect, useState } from "react";
import { getMyProfile, getMyDocuments } from "../../services/profileService";
import StatusBadge from "../../components/common/StatusBadge";
import { uploadMyDoc, getMyDocs } from "../../services/documentService"; // bỏ/giữ getMyDocs tùy bạn

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [p, d] = await Promise.all([getMyProfile(), getMyDocuments()]);
        setProfile(p);
        setDocs(d);
      } catch (e) {
        setErr(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Đang tải…</div>;
  if (err) return <div style={{ padding: 24, color: "#c53030" }}>{err}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        Hồ sơ cá nhân
      </h1>

      {/* Thông tin cơ bản */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Họ tên" value={profile?.fullName} />
          <Field label="Email" value={profile?.email} />
          <Field label="Trường" value={profile?.university} />
          <Field label="Ngành" value={profile?.major} />
          <Field label="Mentor" value={profile?.mentorName || "-"} />
          <Field
            label="Thời gian"
            value={formatRange(profile?.startDate, profile?.endDate)}
          />
        </div>
      </div>

      {/* Tài liệu đã nộp & Trạng thái */}
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "8px 0" }}>
        Tài liệu đã nộp
      </h2>
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
              <Th>Tác vụ</Th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 12, textAlign: "center", color: "#666" }}
                >
                  Chưa có tài liệu.
                </td>
              </tr>
            )}
            {docs.map((it) => (
              <tr key={it.id} style={{ borderTop: "1px solid #eee" }}>
                <Td>{labelOf(it.type)}</Td>
                <Td>{it.fileName}</Td>
                <Td>{formatDate(it.uploadedAt)}</Td>
                <Td>
                  <StatusBadge status={it.status} />
                </Td>
                <Td>{it.note || "-"}</Td>
                <Td>
                  {/* Link tải nếu BE trả URL sẵn, tuỳ API của bạn */}
                  {it.url ? (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12 }}
                    >
                      Xem/Tải
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: "#999" }}>—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value || "-"}</div>
    </div>
  );
}
const Th = ({ children }) => <th style={{ padding: 12 }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: 12 }}>{children}</td>;

function formatDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  return d.toLocaleDateString();
}
function formatRange(a, b) {
  if (!a && !b) return "-";
  return [formatDate(a), formatDate(b)].filter(Boolean).join(" → ");
}
function labelOf(t) {
  const map = {
    CV: "CV",
    APPLICATION: "Đơn xin thực tập",
    CONTRACT: "Hợp đồng",
    OTHER: "Khác",
  };
  return map[t] || t;
}
function UploadBox({ onUploaded }) {
  const [type, setType] = useState("CV");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (!file) {
      setErr("Vui lòng chọn file");
      return;
    }
    setLoading(true);
    try {
      await uploadMyDoc({ type, file });
      setMsg("Đã tải lên, chờ HR duyệt.");
      setFile(null);
      onUploaded && onUploaded();
    } catch (e) {
      setErr("Tải lên thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        marginTop: 16,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Nộp tài liệu</div>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <option value="CV">CV</option>
          <option value="APPLICATION">Đơn xin thực tập</option>
          <option value="CONTRACT">Hợp đồng</option>
          <option value="OTHER">Khác</option>
        </select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          disabled={loading}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: 0,
            background: "#111",
            color: "#fff",
          }}
        >
          {loading ? "Đang tải..." : "Tải lên"}
        </button>
        {msg && <span style={{ color: "#1a7f37", fontSize: 12 }}>{msg}</span>}
        {err && <span style={{ color: "#c53030", fontSize: 12 }}>{err}</span>}
      </form>
      <UploadBox onUploaded={() => getMyDocuments().then(setDocs)} />
    </div>
  );
}
