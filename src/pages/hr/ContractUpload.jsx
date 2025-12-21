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
        {/* Header with Icon */}
        <div className="contract-upload-header">
          <div className="header-icon-wrapper">
            <svg
              className="header-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="contract-upload-title">Quản Lý Hợp Đồng</h1>
          <p className="contract-upload-subtitle">
            Tải lên và quản lý hợp đồng thực tập sinh
          </p>
        </div>

        <div className="contract-upload-form">
          {/* Step Indicator */}
          <div className="steps-indicator">
            <div className={`step ${selectedIntern ? "completed" : "active"}`}>
              <div className="step-number">1</div>
              <div className="step-label">Chọn thực tập sinh</div>
            </div>
            <div className="step-divider"></div>
            <div
              className={`step ${
                file ? "completed" : selectedIntern ? "active" : ""
              }`}
            >
              <div className="step-number">2</div>
              <div className="step-label">Tải file lên</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${file && selectedIntern ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-label">Xác nhận</div>
            </div>
          </div>

          {/* Intern Selection Card */}
          <div className="info-card">
            <div className="card-header">
              <svg
                className="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="card-title">Thông tin thực tập sinh</span>
            </div>

            {selectedIntern ? (
              <div className="selected-intern-info">
                <div className="intern-details">
                  <div className="intern-avatar">
                    {selectedIntern.student.charAt(0).toUpperCase()}
                  </div>
                  <div className="intern-text">
                    <div className="intern-name">{selectedIntern.student}</div>
                    <div className="intern-email">
                      {selectedIntern.studentEmail}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-change"
                  onClick={() => setShowModal(true)}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <button
                className="btn-select-intern-new"
                onClick={() => setShowModal(true)}
              >
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4v16m8-8H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Chọn thực tập sinh từ danh sách
              </button>
            )}
          </div>

          {/* File Upload Card */}
          <div className="info-card">
            <div className="card-header">
              <svg
                className="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="card-title">Tài liệu hợp đồng</span>
            </div>

            <div
              className={`upload-zone ${isDragging ? "dragging" : ""} ${
                fileName ? "has-file" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {fileName ? (
                <div className="file-preview">
                  <div className="file-icon-wrapper">
                    <svg
                      className="file-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="file-info">
                    <div className="file-name-display">{fileName}</div>
                    <div className="file-size">
                      {(file?.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="btn-remove-file"
                    aria-label="Xóa file"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon-circle">
                    <svg
                      className="upload-icon-svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="upload-text-group">
                    <p className="upload-main-text">
                      <label className="upload-link-new">
                        Nhấn để chọn file
                        <input
                          type="file"
                          className="file-input-hidden"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={handleFileSelect}
                        />
                      </label>{" "}
                      hoặc kéo thả vào đây
                    </p>
                    <p className="upload-hint-new">
                      Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              disabled={!fileName || !selectedIntern || uploading}
              onClick={handleUpload}
              className={`btn-upload-new ${uploading ? "uploading" : ""}`}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <svg
                    className="btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Tải lên hợp đồng</span>
                </>
              )}
            </button>
          </div>
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
