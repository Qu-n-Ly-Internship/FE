import { useState } from "react";
import { uploadCV } from "../../services/cvService";
import { useAuthStore } from "../../store/authStore";
import "./DocumentUpload.css";

export default function DocumentUpload() {
  const { user } = useAuthStore();
  const [uploadState, setUploadState] = useState({
    cv: { file: null, uploading: false, message: "", error: "" },
  });
  const [dragOverKey, setDragOverKey] = useState(null);

  const documentTypes = [
    {
      key: "cv",
      type: "CV",
      title: "CV (Curriculum Vitae)",
      description:
        "Tải lên CV của bạn để giới thiệu bản thân với nhà tuyển dụng",
      icon: "📄",
      accept: ".pdf,.docx,.png,.jpg,.jpeg",
    },
  ];

  const handleFileSelect = (docKey, file) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          error: "Kích thước file không được vượt quá 10MB",
          message: "",
        },
      }));
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file,
        error: "",
        message: "",
      },
    }));
  };

  const handleUpload = async (docKey) => {
    const state = uploadState[docKey];

    if (!state.file) {
      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          error: "Vui lòng chọn file",
        },
      }));
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        uploading: true,
        error: "",
        message: "",
      },
    }));

    try {
      await uploadCV({ file: state.file });

      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          uploading: false,
          message: "Tải lên CV thành công! Vui lòng chờ HR duyệt.",
          file: null,
        },
      }));

      // Reset file input
      const input = document.getElementById(`file-${docKey}`);
      if (input) input.value = "";
    } catch (error) {
      const backendMsg = error?.response?.data?.message;
      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          uploading: false,
          error: backendMsg || "Tải lên thất bại. Vui lòng thử lại.",
        },
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
        <div className="card">
          <h2>Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để có thể nộp tài liệu.</p>
          <a href="/login" className="btn btn-primary">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container document-upload">
      {/* Header */}
      <div className="du-header">
        <h1>
          📚{" "}
          {user?.role === "USER"
            ? "Nộp hồ sơ ứng tuyển"
            : "Nộp tài liệu thực tập"}
        </h1>
        <p className="text-secondary">
          {user?.role === "USER"
            ? "Tải lên CV của bạn để ứng tuyển vị trí thực tập sinh"
            : "Tải lên CV của bạn"}
        </p>
        {user?.role === "USER" && (
          <div className="du-note">
            📝 <strong>Lưu ý:</strong> Bạn đang ở trạng thái ứng viên. Sau khi
            nộp hồ sơ, HR sẽ xem xét và liên hệ nếu phù hợp.
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="card">
        <div className="du-user-card">
          <div
            className={`du-avatar ${
              user?.avatar ? "du-avatar--has-image" : ""
            }`}
            style={{
              backgroundImage: user?.avatar ? `url(${user.avatar})` : "none",
            }}
          >
            {!user?.avatar && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
          </div>
          <div className="du-user-info">
            <h3>{user.fullName || "Thực tập sinh"}</h3>
            <p>
              {user.email} •{" "}
              {user.role === "USER" ? "Ứng viên" : "Thực tập sinh"}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Sections */}
      {documentTypes.map((docType) => {
        const state = uploadState[docType.key];
        return (
          <div key={docType.key} className="card du-section">
            {/* Header */}
            <div className="du-section-header">
              <span className="du-section-icon">{docType.icon}</span>
              <div>
                <h3 className="du-section-title">{docType.title}</h3>
                <p className="du-section-desc">{docType.description}</p>
              </div>
            </div>

            {/* File Input Area */}
            <div
              className={`du-dropzone ${
                dragOverKey === docType.key ? "du-dropzone--drag" : ""
              }`}
              onClick={() =>
                document.getElementById(`file-${docType.key}`).click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(docType.key);
              }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverKey(null);
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
                onChange={(e) =>
                  handleFileSelect(docType.key, e.target.files[0])
                }
                className="hidden-input"
              />

              {!state.file ? (
                <div className="du-file-preview">
                  <div className="du-dropzone-icon">📁</div>
                  <div className="du-dropzone-text">
                    Click để chọn file hoặc kéo thả file vào đây
                  </div>
                  <div className="du-dropzone-hint">
                    Hỗ trợ: {docType.accept.replace(/\./g, "").toUpperCase()} •
                    Tối đa 10MB
                  </div>
                </div>
              ) : (
                <div className="du-file-preview">
                  <div className="du-dropzone-icon">✅</div>
                  <div className="du-file-name">{state.file.name}</div>
                  <div className="du-file-size">
                    {formatFileSize(state.file.size)}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="du-actions">
              <button
                onClick={() => handleUpload(docType.key)}
                disabled={!state.file || state.uploading}
                className="btn btn-primary"
              >
                {state.uploading ? "Đang tải lên..." : "Tải lên"}
              </button>

              {state.file && (
                <button
                  onClick={() => {
                    setUploadState((prev) => ({
                      ...prev,
                      [docType.key]: {
                        ...prev[docType.key],
                        file: null,
                        error: "",
                        message: "",
                      },
                    }));
                    document.getElementById(`file-${docType.key}`).value = "";
                  }}
                  className="btn btn-outline-danger"
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Messages */}
            {state.message && (
              <div className="du-alert du-alert--success">
                ✅ {state.message}
              </div>
            )}

            {state.error && (
              <div className="du-alert du-alert--error">❌ {state.error}</div>
            )}
          </div>
        );
      })}

      {/* Help Section */}
      <div className="card du-help">
        <h4 className="du-help-title">
          <span>💡</span> Hướng dẫn
        </h4>
        <ul className="du-help-list">
          <li>CV nên có định dạng PDF hoặc DOCX để đảm bảo hiển thị tốt</li>
          <li>
            CV nên bao gồm thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng
          </li>
          <li>File không được vượt quá 10MB</li>
          <li>
            Sau khi tải lên, HR sẽ xem xét và phản hồi trong vòng 3-5 ngày làm
            việc
          </li>
        </ul>
      </div>
    </div>
  );
}
