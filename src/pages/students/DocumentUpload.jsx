import { useState } from "react";
import { uploadMyDoc } from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import "./profile.css";

export default function DocumentUpload() {
  const { user } = useAuthStore();
  const [uploadState, setUploadState] = useState({
    cv: { file: null, uploading: false, message: "", error: "" },
    application: { file: null, uploading: false, message: "", error: "" },
    other: { file: null, uploading: false, message: "", error: "" }
  });

  const documentTypes = [
    {
      key: "cv",
      type: "CV",
      title: "CV (Curriculum Vitae)",
      description: "Tải lên CV của bạn để giới thiệu bản thân với nhà tuyển dụng",
      icon: "📄",
      accept: ".pdf,.docx,.png,.jpg,.jpeg"
    },
    {
      key: "application",
      type: "APPLICATION", 
      title: "Đơn xin thực tập",
      description: "Đơn đăng ký thực tập chính thức của bạn",
      icon: "📝",
      accept: ".pdf,.docx"
    },
    {
      key: "other",
      type: "OTHER",
      title: "Tài liệu khác",
      description: "Các tài liệu bổ sung như chứng chỉ, bằng cấp, portfolio...",
      icon: "📎",
      accept: ".pdf,.docx,.png,.jpg,.jpeg"
    }
  ];

  const handleFileSelect = (docKey, file) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          error: "Kích thước file không được vượt quá 10MB",
          message: ""
        }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file,
        error: "",
        message: ""
      }
    }));
  };

  const handleUpload = async (docKey) => {
    const docInfo = documentTypes.find(d => d.key === docKey);
    const state = uploadState[docKey];
    
    if (!state.file) {
      setUploadState(prev => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          error: "Vui lòng chọn file"
        }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        uploading: true,
        error: "",
        message: ""
      }
    }));

    try {
      // TODO(stagewise): Replace with actual API call
      await uploadMyDoc({ type: docInfo.type, file: state.file });
      
      setUploadState(prev => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          uploading: false,
          message: "Tải lên thành công! Chờ HR duyệt.",
          file: null
        }
      }));

      // Reset file input
      const input = document.getElementById(`file-${docKey}`);
      if (input) input.value = "";

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          uploading: false,
          error: "Tải lên thất bại. Vui lòng thử lại."
        }
      }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!user) {
    return (
      <div className="page-container">
        <h2>Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để có thể nộp tài liệu.</p>
        <a href="/login" style={{ color: "#007bff" }}>Đăng nhập ngay</a>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 className="profile-title">
          📚 {user?.role === "USER" ? "Nộp hồ sơ ứng tuyển" : "Nộp tài liệu thực tập"}
        </h1>
        <p style={{ color: "#666", fontSize: "16px", marginTop: "8px" }}>
          {user?.role === "USER" 
            ? "Tải lên CV và đơn xin thực tập của bạn để ứng tuyển vị trí thực tập sinh"
            : "Tải lên các tài liệu cần thiết cho quá trình thực tập"
          }
        </p>
        
        {user?.role === "USER" && (
          <div style={{
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d7ff",
            borderRadius: "8px",
            padding: "12px 16px",
            marginTop: "16px",
            fontSize: "14px",
            color: "#0056b3"
          }}>
            📝 <strong>Lưu ý:</strong> Bạn đang ở trạng thái ứng viên. Sau khi nộp hồ sơ, HR sẽ xem xét và liên hệ nếu phù hợp.
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="upload-card" style={{ marginBottom: "24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: user?.avatar ? "transparent" : "#007bff",
              backgroundImage: user?.avatar ? `url(${user.avatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              border: "2px solid #e5e5e5",
            }}
          >
            {!user?.avatar && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "16px" }}>
              {user.fullName || "Thực tập sinh"}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              {user.email} • {user.role === "USER" ? "Ứng viên" : "Thực tập sinh"}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Sections */}
      {documentTypes.map((docType) => {
        const state = uploadState[docType.key];
        return (
          <div key={docType.key} className="upload-card" style={{ marginBottom: "24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>{docType.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                  {docType.title}
                </h3>
                <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                  {docType.description}
                </p>
              </div>
            </div>

            {/* File Input Area */}
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "#fafafa",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById(`file-${docType.key}`).click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#007bff";
                e.currentTarget.style.backgroundColor = "#f0f8ff";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.backgroundColor = "#fafafa";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.backgroundColor = "#fafafa";
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileSelect(docType.key, files[0]);
                }
              }}
            >
              <input
                id={`file-${docType.key}`}
                type="file"
                accept={docType.accept}
                onChange={(e) => handleFileSelect(docType.key, e.target.files[0])}
                style={{ display: "none" }}
              />

              {!state.file ? (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
                    Click để chọn file hoặc kéo thả file vào đây
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Hỗ trợ: {docType.accept.replace(/\./g, "").toUpperCase()} • Tối đa 10MB
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
                    {state.file.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {formatFileSize(state.file.size)}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                onClick={() => handleUpload(docType.key)}
                disabled={!state.file || state.uploading}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  backgroundColor: state.file && !state.uploading ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: state.file && !state.uploading ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                }}
              >
                {state.uploading ? "Đang tải lên..." : "Tải lên"}
              </button>

              {state.file && (
                <button
                  onClick={() => {
                    setUploadState(prev => ({
                      ...prev,
                      [docType.key]: {
                        ...prev[docType.key],
                        file: null,
                        error: "",
                        message: ""
                      }
                    }));
                    document.getElementById(`file-${docType.key}`).value = "";
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    color: "#dc3545",
                    border: "1px solid #dc3545",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Messages */}
            {state.message && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#d4edda",
                color: "#155724",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                ✅ {state.message}
              </div>
            )}

            {state.error && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                ❌ {state.error}
              </div>
            )}
          </div>
        );
      })}

      {/* Help Section */}
      <div className="upload-card" style={{ backgroundColor: "#e7f3ff", border: "1px solid #b3d7ff" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#0056b3", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>💡</span> Hướng dẫn
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#0056b3", fontSize: "14px" }}>
          <li>CV nên có định dạng PDF hoặc DOCX để đảm bảo hiển thị tốt</li>
          <li>Đơn xin thực tập cần ghi rõ thời gian mong muốn và lý do ứng tuyển</li>
          <li>Tài liệu khác có thể bao gồm: chứng chỉ, bằng cấp, portfolio, dự án cá nhân</li>
          <li>Mỗi file không được vượt quá 10MB</li>
          <li>Sau khi tải lên, HR sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc</li>
        </ul>
      </div>
    </div>
  );
}