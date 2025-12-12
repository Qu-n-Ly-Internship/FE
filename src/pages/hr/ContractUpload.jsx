import React, { useState } from "react";
import { uploadToCloud } from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../styles/variables.css";
import "../../styles/forms.css";
import "./ContractUpload.css";

export default function ContractUpload() {
  const user = useAuthStore((s) => s.user);

  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const clearFile = () => {
    setFileName("");
    setFile(null);
  };

  const handleUpload = async () => {
    if (!selectedIntern || !file) return;

    setUploading(true);

    try {
      const hrId = user?.id;
      const internId =
        selectedIntern?.intern_id ||
        selectedIntern?.internProfileId ||
        selectedIntern?.id;

      if (!hrId || hrId === "undefined" || hrId === undefined) {
        toast.error("Không tìm thấy thông tin HR. Vui lòng đăng nhập lại!");

        setUploading(false);

        return;
      }

      if (!internId || internId === "undefined" || internId === undefined) {
        toast.error("Không tìm thấy ID thực tập sinh!");

        setUploading(false);

        return;
      }

      const response = await uploadToCloud({
        internProfileId: internId,
        file: file,
        hrId: Number(hrId),
      });

      console.log("Upload success:", response);
      toast.success("✓ Upload thành công!");

      setTimeout(() => {
        setFile(null);
        setFileName("");
        setSelectedIntern(null);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Upload thất bại. Vui lòng thử lại!"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="contract-upload-page">
      <div className="contract-upload-container">
        <div className="contract-upload-header">
          <h1 className="contract-upload-title">Upload Hợp Đồng</h1>
        </div>

        <div className="contract-upload-form">
          {/* Intern Selection */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Tên Thực Tập Sinh</label>
              <button
                className="btn-select-intern"
                onClick={() => setShowModal(true)}
              >
                Chọn từ danh sách
              </button>
            </div>
            <input
              type="text"
              placeholder="Nhập tên hoặc email thực tập sinh..."
              value={
                selectedIntern
                  ? `${selectedIntern.student} (${selectedIntern.studentEmail})`
                  : ""
              }
              readOnly
              className={`form-input ${selectedIntern ? "has-value" : ""}`}
            />
          </div>

          {/* File Upload Area */}
          <div
            className={`upload-area ${isDragging ? "dragging" : ""} ${
              fileName ? "has-file" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">📄</div>

              {fileName ? (
                <div className="file-selected">
                  <span className="file-name">{fileName}</span>
                  <button
                    onClick={clearFile}
                    className="btn-clear-file"
                    aria-label="Xóa file"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-instructions">
                  <p className="upload-text">
                    Kéo thả file vào đây hoặc{" "}
                    <label className="upload-link">
                      chọn file
                      <input
                        type="file"
                        className="file-input-hidden"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="upload-hint">
                    PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <button
            disabled={!fileName || !selectedIntern || uploading}
            onClick={handleUpload}
            className={`btn-upload ${uploading ? "uploading" : ""}`}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Đang tải lên...
              </>
            ) : (
              <>📤 Upload File</>
            )}
          </button>
        </div>
      </div>

      {showModal && (
        <InternSelectionModal
          onClose={() => setShowModal(false)}
          onSelect={(intern) => {
            setSelectedIntern(intern);
            setShowModal(false);
          }}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}
