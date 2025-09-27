import { useEffect, useState } from "react";
import { getMyProfile, getMyDocuments } from "../../services/profileService";
import StatusBadge from "../../components/common/StatusBadge";
import { uploadMyDoc, getMyDocs } from "../../services/documentService"; // bỏ/giữ getMyDocs tùy bạn
import { useAuthStore } from "../../store/authStore";
import "./profile.css";

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  // Avatar upload handler
  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);

    // TODO(stagewise): Replace with actual API call to upload avatar
    // For now, we'll use FileReader to create a local URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setAvatarUrl(imageUrl);
      
      // Update user data in store
      const updatedUser = { ...user, avatar: imageUrl };
      const currentStorage = localStorage.getItem('auth-storage');
      const token = currentStorage ? JSON.parse(currentStorage).state.token : null;
      setAuth(updatedUser, token);
      
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="page-container">Đang tải…</div>;
  if (err) return <div className="page-container error-text">{err}</div>;
  
  // Debug: Kiểm tra dữ liệu user
  console.log('Current user:', user);
  console.log('Profile data:', profile);
  
  // Nếu không có user data, hiển thị thông báo
  if (!user) {
    return (
      <div className="page-container">
        <h2>Không tìm thấy thông tin người dùng</h2>
        <p>Vui lòng <a href="/login">đăng nhập lại</a></p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => document.getElementById('avatar-upload').click()}
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: avatarUrl ? "transparent" : "#007bff",
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "600",
              cursor: "pointer",
              border: "2px solid #e5e5e5",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            {!avatarUrl && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
            
            {/* Overlay khi hover */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                fontSize: "12px",
                textAlign: "center",
                padding: "4px",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = 0;
              }}
            >
              {uploadingAvatar ? "Đang tải..." : "Thay đổi ảnh"}
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: "none" }}
          />
        </div>
        <div>
          <h1 className="profile-title" style={{ margin: 0 }}>
            {user?.fullName || "Người dùng"}
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
            {user?.role || "Unknown"} • {user?.email || "No email"}
          </p>
        </div>
      </div>



      {/* Thông tin cơ bản */}
      <div className="upload-card" style={{ marginBottom: 16 }}>
        <div className="field-grid">
          <Field label="Họ tên" value={profile?.fullName} />
          <Field label="Email" value={profile?.email} />
          <Field label="Vai trò" value={profile?.role} />
          
          {/* Hiển thị thông tin theo vai trò */}
          {user?.role === "INTERN" && (
            <>
              <Field label="Trường" value={profile?.university} />
              <Field label="Ngành" value={profile?.major} />
              <Field label="Mentor" value={profile?.mentorName || "-"} />
              <Field
                label="Thời gian thực tập"
                value={formatRange(profile?.startDate, profile?.endDate)}
              />
            </>
          )}
          
          {(user?.role === "HR" || user?.role === "ADMIN") && (
            <>
              <Field label="Phòng ban" value={profile?.department} />
              <Field label="Chức vụ" value={profile?.position} />
              <Field label="Ngày vào làm" value={formatDate(profile?.joinDate)} />
              {user?.role === "ADMIN" && (
                <Field label="Quyền hạn" value={profile?.permissions} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Tài liệu - chỉ hiển thị cho INTERN */}
      {user?.role === "INTERN" && (
        <>
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
          <UploadBox onUploaded={() => getMyDocuments(user).then(setDocs)} />
        </>
      )}
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
