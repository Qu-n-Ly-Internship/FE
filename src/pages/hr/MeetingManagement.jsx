import React, { useState, useEffect } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MeetingManagement.css";

import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../../services/meetingService";
import apiClient from "../../services/apiClient";

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  return dayjs(dateTimeString).format("DD/MM/YYYY HH:mm");
};

const getStatusBadge = (status) => {
  const statusMap = {
    SCHEDULED: { label: "Đã lên lịch", class: "badge-primary" },
    COMPLETED: { label: "Đã hoàn thành", class: "badge-success" },
    CANCELLED: { label: "Đã hủy", class: "badge-danger" },
    "Đã tạo lịch": { label: "Đã tạo lịch", class: "badge-primary" },
  };
  const info = statusMap[status] || { label: status, class: "" };
  return <span className={`badge ${info.class}`}>{info.label}</span>;
};

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getMeetings();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load meetings:", error);
      toast.error(error.message || "Không thể tải danh sách lịch họp!");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (newMeeting) => {
    try {
      await createMeeting(newMeeting);
      toast.success("Tạo lịch họp thành công! 🎉");
      await loadMeetings();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      toast.error(error.message || "Tạo lịch họp thất bại!");
    }
  };

  const handleUpdateMeeting = async (updatedMeeting) => {
    try {
      await updateMeeting(editingMeeting.id, updatedMeeting);
      toast.success("Cập nhật lịch họp thành công! ✅");
      await loadMeetings();
      setEditingMeeting(null);
    } catch (error) {
      console.error("Failed to update meeting:", error);
      toast.error(error.message || "Cập nhật lịch họp thất bại!");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch họp này?")) return;

    try {
      await deleteMeeting(meetingId);
      toast.success("Xóa lịch họp thành công!");
      await loadMeetings();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error(error.message || "Xóa lịch họp thất bại!");
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = searchText
      ? meeting.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        meeting.programTitle?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesStatus = statusFilter ? meeting.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredMeetings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredMeetings.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="page-header">
        <h1 className="page-title">Quản lý Lịch Họp</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          Tạo lịch họp mới
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="form-row"
          style={{
            padding: 16,
            gap: 16,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div className="form-group">
            <label htmlFor="searchFilter" className="form-label">
              Tìm kiếm
            </label>
            <input
              className="form-input"
              placeholder="Tìm theo tiêu đề, địa điểm, chương trình"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lọc theo Trạng thái</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div className="form-group">
            <button
              type="button"
              className="btn btn-clear"
              onClick={() => {
                setSearchText("");
                setStatusFilter("");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tiêu đề</th>
              <th className="table-th">Chương trình</th>
              <th className="table-th">Thời gian bắt đầu</th>
              <th className="table-th">Thời gian kết thúc</th>
              <th className="table-th">Địa điểm</th>
              <th className="table-th">Số TTS</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="table-td center">
                  Đang tải...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-td center">
                  Chưa có lịch họp nào.
                </td>
              </tr>
            ) : (
              pageItems.map((meeting, index) => (
                <tr key={meeting.id}>
                  <td className="table-td">{startIndex + index + 1}</td>
                  <td className="table-td">{meeting.title}</td>
                  <td className="table-td">{meeting.programTitle || "-"}</td>
                  <td className="table-td">
                    {formatDateTime(meeting.startTime)}
                  </td>
                  <td className="table-td">
                    {formatDateTime(meeting.endTime)}
                  </td>
                  <td className="table-td">{meeting.location || "-"}</td>
                  <td className="table-td">{meeting.internCount || 0}</td>
                  <td className="table-td">{getStatusBadge(meeting.status)}</td>
                  <td className="table-td">
                    <button
                      className="btn btn-success btn-sm"
                      style={{ marginRight: 8 }}
                      onClick={() => setViewingMeeting(meeting)}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      style={{ marginRight: 8 }}
                      onClick={() => setEditingMeeting(meeting)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm xoa"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {totalItems === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, totalItems)} trên {totalItems}
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="page-dots">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`btn btn-sm page-btn ${
                    p === currentPage ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMeeting}
        />
      )}

      {editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onUpdate={handleUpdateMeeting}
        />
      )}

      {viewingMeeting && (
        <ViewMeetingModal
          meeting={viewingMeeting}
          onClose={() => setViewingMeeting(null)}
        />
      )}
    </div>
  );
}

// ==================== CREATE MODAL ====================
function CreateMeetingModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await apiClient.get("/projects");
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load programs:", error);
      toast.error("Không thể tải danh sách chương trình!");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Tiêu đề không được để trống";
    if (!programId) newErrors.programId = "Vui lòng chọn chương trình";
    if (!startTime) newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!endTime) newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    if (startTime && endTime && endTime.isBefore(startTime)) {
      newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (!location.trim()) newErrors.location = "Địa điểm không được để trống";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onCreate({
      programId,
      title: title.trim(),
      description: description.trim() || "",
      startTime: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      location: location.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 className="modal-title" style={{ margin: 0 }}>
            Tạo Lịch Họp Mới
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="program">Chương trình *</label>
            <Select
              id="program"
              style={{ width: "100%" }}
              placeholder="Chọn chương trình"
              value={programId}
              onChange={(value) => setProgramId(value)}
              status={errors.programId ? "error" : undefined}
              options={programs.map((p) => ({
                value: p.project_id || p.id,
                label: p.title,
              }))}
            />
            {errors.programId && (
              <div className="error-message">{errors.programId}</div>
            )}
            <small
              style={{
                color: "#666",
                fontSize: 12,
                marginTop: 4,
                display: "block",
              }}
            >
              Lịch họp sẽ được tạo cho tất cả thực tập sinh trong chương trình
              này
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="title">Tiêu đề cuộc họp *</label>
            <input
              id="title"
              type="text"
              className={`form-input ${errors.title ? "input-error" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Họp tổng kết tháng"
            />
            {errors.title && (
              <div className="error-message">{errors.title}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-time">Thời gian bắt đầu *</label>
              <DatePicker
                id="start-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={startTime}
                onChange={(value) => setStartTime(value)}
                className="app-date-picker"
                style={{ width: "100%" }}
                status={errors.startTime ? "error" : undefined}
                placeholder="Chọn ngày và giờ bắt đầu"
              />
              {errors.startTime && (
                <div className="error-message">{errors.startTime}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end-time">Thời gian kết thúc *</label>
              <DatePicker
                id="end-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={endTime}
                onChange={(value) => setEndTime(value)}
                className="app-date-picker"
                style={{ width: "100%" }}
                status={errors.endTime ? "error" : undefined}
                placeholder="Chọn ngày và giờ kết thúc"
              />
              {errors.endTime && (
                <div className="error-message">{errors.endTime}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Địa điểm *</label>
            <input
              id="location"
              type="text"
              className={`form-input ${errors.location ? "input-error" : ""}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Phòng họp A, Tầng 3"
            />
            {errors.location && (
              <div className="error-message">{errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả cuộc họp</label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung, chương trình cuộc họp..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo lịch họp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== EDIT MODAL ====================
function EditMeetingModal({ meeting, onClose, onUpdate }) {
  const [title, setTitle] = useState(meeting.title || "");
  const [startTime, setStartTime] = useState(
    meeting.startTime ? dayjs(meeting.startTime) : null
  );
  const [endTime, setEndTime] = useState(
    meeting.endTime ? dayjs(meeting.endTime) : null
  );
  const [location, setLocation] = useState(meeting.location || "");
  const [description, setDescription] = useState(meeting.description || "");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Tiêu đề không được để trống";
    if (!startTime) newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!endTime) newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    if (startTime && endTime && endTime.isBefore(startTime)) {
      newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (!location.trim()) newErrors.location = "Địa điểm không được để trống";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onUpdate({
      title: title.trim(),
      description: description.trim() || "",
      startTime: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      location: location.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 className="modal-title" style={{ margin: 0 }}>
            Chỉnh Sửa Lịch Họp
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Chương trình</label>
            <input
              type="text"
              className="form-input"
              value={meeting.programTitle || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
            />
            <small style={{ color: "#666", fontSize: 12 }}>
              Không thể thay đổi chương trình
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="edit-title">Tiêu đề cuộc họp *</label>
            <input
              id="edit-title"
              type="text"
              className={`form-input ${errors.title ? "input-error" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <div className="error-message">{errors.title}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-start-time">Thời gian bắt đầu *</label>
              <DatePicker
                id="edit-start-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={startTime}
                onChange={(value) => setStartTime(value)}
                className="app-date-picker"
                style={{ width: "100%" }}
                status={errors.startTime ? "error" : undefined}
              />
              {errors.startTime && (
                <div className="error-message">{errors.startTime}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-end-time">Thời gian kết thúc *</label>
              <DatePicker
                id="edit-end-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={endTime}
                onChange={(value) => setEndTime(value)}
                className="app-date-picker"
                style={{ width: "100%" }}
                status={errors.endTime ? "error" : undefined}
              />
              {errors.endTime && (
                <div className="error-message">{errors.endTime}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-location">Địa điểm *</label>
            <input
              id="edit-location"
              type="text"
              className={`form-input ${errors.location ? "input-error" : ""}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {errors.location && (
              <div className="error-message">{errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Mô tả</label>
            <textarea
              id="edit-description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== VIEW MODAL ====================
function ViewMeetingModal({ meeting, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 className="modal-title" style={{ margin: 0 }}>
            Chi Tiết Lịch Họp
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="view-details">
          <div className="detail-row">
            <label>Chương trình:</label>
            <div>{meeting.programTitle || "-"}</div>
          </div>
          <div className="detail-row">
            <label>Tiêu đề:</label>
            <div>{meeting.title}</div>
          </div>
          <div className="detail-row">
            <label>Thời gian bắt đầu:</label>
            <div>{formatDateTime(meeting.startTime)}</div>
          </div>
          <div className="detail-row">
            <label>Thời gian kết thúc:</label>
            <div>{formatDateTime(meeting.endTime)}</div>
          </div>
          <div className="detail-row">
            <label>Địa điểm:</label>
            <div>{meeting.location || "-"}</div>
          </div>
          <div className="detail-row">
            <label>Trạng thái:</label>
            <div>{meeting.status}</div>
          </div>
          <div className="detail-row">
            <label>Mô tả:</label>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {meeting.description || "Không có mô tả"}
            </div>
          </div>
          <div className="detail-row">
            <label>Số thực tập sinh:</label>
            <div>{meeting.internCount || 0}</div>
          </div>
          {meeting.interns && meeting.interns.length > 0 && (
            <div className="detail-row">
              <label>Danh sách thực tập sinh:</label>
              <div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {meeting.interns.map((intern, idx) => (
                    <li key={idx}>
                      {intern.internName} ({intern.internEmail})
                      {intern.calendarSynced && " ✅"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="detail-row">
            <label>Người tạo:</label>
            <div>{meeting.createdBy || meeting.hrName || "-"}</div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
