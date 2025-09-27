import { useEffect, useState } from "react";
import { getMyProfile } from "../../services/profileService";
import { useAuthStore } from "../../store/authStore";
import "./profile.css";

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile(user);
        setProfile(p);
        setEditedProfile(p);
      } catch (e) {
        setErr(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

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
      // TODO(stagewise): Replace with actual API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      setProfile(editedProfile);
      
      // Update user data in auth store if basic info changed
      if (editedProfile.fullName !== user.fullName || editedProfile.email !== user.email) {
        const updatedUser = {
          ...user,
          fullName: editedProfile.fullName,
          email: editedProfile.email
        };
        const currentStorage = localStorage.getItem('auth-storage');
        const token = currentStorage ? JSON.parse(currentStorage).state.token : null;
        setAuth(updatedUser, token);
      }
      
      setIsEditing(false);
    } catch (error) {
      alert('Lưu thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
        {/* Header with Edit button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Thông tin cá nhân</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: saving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {saving ? "Đang lưu..." : "✓ Lưu"}
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="field-grid">
          <EditableField 
            label="Họ tên" 
            value={isEditing ? editedProfile?.fullName : profile?.fullName}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('fullName', value)}
          />
          <EditableField 
            label="Email" 
            value={isEditing ? editedProfile?.email : profile?.email}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('email', value)}
            type="email"
          />
          <Field label="Vai trò" value={profile?.role} />
          
          {/* Hiển thị thông tin theo vai trò */}
          {user?.role === "USER" && (
            <>
              <Field label="Trạng thái" value={profile?.status} />
              <EditableField 
                label="Trường" 
                value={isEditing ? editedProfile?.university : profile?.university}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('university', value)}
              />
              <EditableField 
                label="Ngành" 
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('major', value)}
              />
              <Field label="Ngày ứng tuyển" value={formatDate(profile?.appliedDate)} />
              <EditableField 
                label="Thời gian mong muốn" 
                value={isEditing ? editedProfile?.expectedStartDate : profile?.expectedStartDate}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('expectedStartDate', value)}
                type="date"
              />
            </>
          )}
          
          {user?.role === "INTERN" && (
            <>
              <Field label="Trạng thái" value={profile?.status} />
              <EditableField 
                label="Trường" 
                value={isEditing ? editedProfile?.university : profile?.university}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('university', value)}
              />
              <EditableField 
                label="Ngành" 
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('major', value)}
              />
              <Field label="Mentor" value={profile?.mentorName || "-"} />
              <Field label="Thời gian thực tập" value={formatRange(profile?.startDate, profile?.endDate)} />
            </>
          )}
          
          {(user?.role === "HR" || user?.role === "ADMIN") && (
            <>
              <EditableField 
                label="Phòng ban" 
                value={isEditing ? editedProfile?.department : profile?.department}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('department', value)}
              />
              <EditableField 
                label="Chức vụ" 
                value={isEditing ? editedProfile?.position : profile?.position}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('position', value)}
              />
              <EditableField 
                label="Ngày vào làm" 
                value={isEditing ? editedProfile?.joinDate : profile?.joinDate}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('joinDate', value)}
                type="date"
              />
              {user?.role === "ADMIN" && (
                <Field label="Quyền hạn" value={profile?.permissions} />
              )}
            </>
          )}
        </div>
      </div>


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

function EditableField({ label, value, isEditing, onChange, type = "text" }) {
  if (!isEditing) {
    return (
      <div>
        <div className="field-label">{label}</div>
        <div className="field-value">{type === "date" ? formatDate(value) : (value || "-")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="field-label">{label}</div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "14px",
          backgroundColor: "#fff",
          transition: "border-color 0.2s"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#007bff";
          e.target.style.outline = "none";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#ddd";
        }}
      />
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

