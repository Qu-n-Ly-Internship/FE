import { useEffect, useState } from "react";
import { getMyProfile, getMyDocuments } from "../../services/profileService";
import StatusBadge from "../../components/common/StatusBadge";
import { uploadMyDoc } from "../../services/documentService"; // bỏ/giữ getMyDocs tùy bạn
import "./profile.css";

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

  if (loading) return <div className="page-container">Đang tải…</div>;
  if (err) return <div className="page-container error-text">{err}</div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Hồ sơ cá nhân</h1>

      {/* Thông tin cơ bản */}
      <div className="upload-card" style={{ marginBottom: 16 }}>
        <div className="field-grid">
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
      <h2 className="section-title">Tài liệu đã nộp</h2>
      <div className="upload-card">
        <table className="table" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th className="table-th">Tài liệu</th>
              <th className="table-th">Tên file</th>
              <th className="table-th">Ngày nộp</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Ghi chú</th>
              <th className="table-th">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr>
                <td colSpan={6} className="center" style={{ padding: 12, color: "#666" }}>
                  Chưa có tài liệu.
                </td>
              </tr>
            )}
            {docs.map((it) => (
              <tr key={it.id}>
                <td className="table-td">{labelOf(it.type)}</td>
                <td className="table-td">{it.fileName}</td>
                <td className="table-td">{formatDate(it.uploadedAt)}</td>
                <td className="table-td">
                  <StatusBadge status={it.status} />
                </td>
                <td className="table-td">{it.note || "-"}</td>
                <td className="table-td">
                  {it.url ? (
                    <a href={it.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                      Xem/Tải
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: "#999" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Khu vực nộp tài liệu */}
      <UploadBox onUploaded={() => getMyDocuments().then(setDocs)} />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "-"}</div>
    </div>
  );
}

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
    <div className="upload-card">
      <div className="upload-title">Nộp tài liệu</div>
      <form onSubmit={onSubmit} className="upload-form">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CV">CV</option>
          <option value="APPLICATION">Đơn xin thực tập</option>
          <option value="CONTRACT">Hợp đồng</option>
          <option value="OTHER">Khác</option>
        </select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button disabled={loading} className="btn btn-primary">
          {loading ? "Đang tải..." : "Tải lên"}
        </button>
        {msg && <span className="hint-success">{msg}</span>}
        {err && <span className="hint-error">{err}</span>}
      </form>
    </div>
  );
}
