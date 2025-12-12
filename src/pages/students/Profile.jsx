import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/profileService";
import { useAuthStore } from "../../store/authStore";
import "./Profile.css";

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile(user);
        console.log("📦 Profile data received:", p);
        setProfile(p);
        setEditedProfile(p);
      } catch (e) {
        console.error("❌ Error fetching profile:", e);
        setError(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setAvatarUrl(imageUrl);

      const updatedUser = { ...user, avatar: imageUrl };
      const currentStorage = localStorage.getItem("auth-storage");
      const token = currentStorage
        ? JSON.parse(currentStorage).state.token
        : null;
      setAuth(updatedUser, token);

      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        fullName: editedProfile.fullName,
        email: editedProfile.email,
        university: editedProfile.university,
        major: editedProfile.major,
        phone: editedProfile.phone,
      });

      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage")).state.token
        : null;

      setProfile(editedProfile);

      if (
        editedProfile.fullName !== user.fullName ||
        editedProfile.email !== user.email
      ) {
        const updatedUser = {
          ...user,
          fullName: editedProfile.fullName,
          email: editedProfile.email,
        };
        setAuth(updatedUser, token);
      }

      setIsEditing(false);
      alert("✅ Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Lưu thông tin thất bại: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="page-container profile-page">
        <div className="profile-loading">Đang tải…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container profile-page">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="page-container profile-page">
        <div className="card">
          <h2>Không tìm thấy thông tin người dùng</h2>
          <p>
            Vui lòng <a href="/login">đăng nhập lại</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div
            onClick={() => document.getElementById("avatar-upload").click()}
            className={`profile-avatar ${
              avatarUrl ? "profile-avatar--has-image" : ""
            }`}
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
            }}
          >
            {!avatarUrl && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
            <div className="profile-avatar-overlay">
              {uploadingAvatar ? "Đang tải..." : "Thay đổi ảnh"}
            </div>
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden-input"
          />
        </div>

        <div className="profile-user-info">
          <h1>{profile?.fullName || user?.fullName || "Người dùng"}</h1>
          <p className="profile-user-subtitle">
            {profile?.role || user?.role || "Unknown"} •{" "}
            {profile?.email || user?.email || "No email"}
          </p>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="card profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">Thông tin cá nhân</h3>
          <div className="btn-group">
            {!isEditing ? (
              <button onClick={handleEdit} className="btn btn-primary">
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? "Đang lưu..." : "✓ Lưu"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-info-grid">
          <EditableField
            label="Họ tên"
            value={isEditing ? editedProfile?.fullName : profile?.fullName}
            isEditing={isEditing}
            onChange={(value) => handleInputChange("fullName", value)}
          />
          <EditableField
            label="Email"
            value={isEditing ? editedProfile?.email : profile?.email}
            isEditing={isEditing}
            onChange={(value) => handleInputChange("email", value)}
            type="email"
          />
          <Field label="Vai trò" value={profile?.role} />

          {/* Hiển thị thông tin theo vai trò */}
          {(profile?.role === "USER" || profile?.role === "INTERN") && (
            <>
              <Field
                label="Trạng thái"
                value={profile?.status || profile?.internStatus}
              />
              <EditableField
                label="Trường"
                value={
                  isEditing ? editedProfile?.university : profile?.university
                }
                isEditing={isEditing}
                onChange={(value) => handleInputChange("university", value)}
              />
              <EditableField
                label="Ngành"
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("major", value)}
              />
              <EditableField
                label="Số điện thoại"
                value={isEditing ? editedProfile?.phone : profile?.phone}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("phone", value)}
              />
              <Field
                label="Mentor"
                value={profile?.mentorName || "Chưa phân công"}
              />
              <Field
                label="Thời gian thực tập"
                value={formatRange(profile?.startDate, profile?.endDate)}
              />
              {profile?.programTitle && (
                <Field label="Chương trình" value={profile?.programTitle} />
              )}
            </>
          )}

          {/* HR */}
          {profile?.role === "HR" && (
            <EditableField
              label="Chức vụ"
              value={isEditing ? editedProfile?.position : profile?.position}
              isEditing={isEditing}
              onChange={(value) => handleInputChange("position", value)}
            />
          )}

          {/* ADMIN */}
          {profile?.role === "ADMIN" && (
            <>
              <EditableField
                label="Chức vụ"
                value={isEditing ? editedProfile?.position : profile?.position}
                isEditing={isEditing}
                onChange={(value) => handleInputChange("position", value)}
              />
              <Field label="Quyền hạn" value={profile?.permissions} />
            </>
          )}

          {/* MENTOR */}
          {profile?.role === "MENTOR" && (
            <Field
              label="Phòng ban"
              value={profile?.department || "Chưa phân công"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="profile-field">
      <div className="profile-field-label">{label}</div>
      <div className="profile-field-value">{value || "-"}</div>
    </div>
  );
}

function EditableField({ label, value, isEditing, onChange, type = "text" }) {
  if (!isEditing) {
    return (
      <div className="profile-field">
        <div className="profile-field-label">{label}</div>
        <div className="profile-field-value">
          {type === "date" ? formatDate(value) : value || "-"}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-field">
      <div className="profile-field-label">{label}</div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function formatDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return s;
  }
}

function formatRange(a, b) {
  if (!a && !b) return "-";
  const start = formatDate(a);
  const end = formatDate(b);
  if (start === "-" && end === "-") return "-";
  if (start === "-") return `Đến ${end}`;
  if (end === "-") return `Từ ${start}`;
  return `${start} → ${end}`;
}
