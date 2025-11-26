import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MeetingManagement.css";

import InternSelectionModal from "../../components/common/InternSelectionModal";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../../services/meetingService";

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "";
  return dayjs(dateTimeString).format("DD/MM/YYYY HH:mm");
}

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

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getMeetings();
      console.log("Loaded meetings:", data);
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load meetings:", error);
      toast.error("Không thể tải danh sách lịch họp!");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (newMeeting) => {
    try {
      const response = await createMeeting(newMeeting);
      console.log("Create response:", response);

      if (response.success || response.meetingId) {
        toast.success(
          "Tạo lịch họp thành công! 🎉 Email đã được gửi tới thực tập sinh."
        );
        await loadMeetings();
        setShowCreateModal(false);
      } else {
        toast.error(response.message || "Tạo lịch họp thất bại!");
      }
    } catch (error) {
      console.error("Failed to create meeting:", error);
      const errorMessage =
        error.response?.data?.message || "Tạo lịch họp thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleUpdateMeeting = async (updatedMeeting) => {
    try {
      const response = await updateMeeting(
        editingMeeting.meetingId,
        updatedMeeting
      );

      if (response.success) {
        toast.success(
          "Cập nhật lịch họp thành công! ✅ Email thông báo đã được gửi."
        );
        await loadMeetings();
        setEditingMeeting(null);
      } else {
        toast.error(response.message || "Cập nhật lịch họp thất bại!");
      }
    } catch (error) {
      console.error("Failed to update meeting:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật lịch họp thất bại!"
      );
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch họp này?")) {
      return;
    }

    try {
      const response = await deleteMeeting(meetingId);
      if (response.success) {
        toast.success("Xóa lịch họp thành công!");
        await loadMeetings();
      }
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error(error.response?.data?.message || "Xóa lịch họp thất bại!");
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = searchText
      ? meeting.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesStatus = statusFilter ? meeting.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const totalItems = filteredMeetings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredMeetings.slice(startIndex, startIndex + pageSize);

  function getPageNumbers() {
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
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { label: "Đã lên lịch", class: "badge-primary" },
      completed: { label: "Đã hoàn thành", class: "badge-success" },
      cancelled: { label: "Đã hủy", class: "badge-danger" },
    };
    const info = statusMap[status] || { label: status, class: "" };
    return <span className={`badge ${info.class}`}>{info.label}</span>;
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
            <label className="form-label">Tìm kiếm</label>
            <input
              className="form-input"
              placeholder="Tìm theo tiêu đề hoặc địa điểm"
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
              <option value="scheduled">Đã lên lịch</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="form-group">
            <button
              type="button"
              className="btn clear-filters-btn"
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

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tiêu đề</th>
              <th className="table-th">Thời gian</th>
              <th className="table-th">Địa điểm</th>
              <th className="table-th">Số người tham gia</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-td center">
                  Đang tải...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-td center">
                  Chưa có lịch họp nào.
                </td>
              </tr>
            ) : (
              pageItems.map((meeting, index) => (
                <tr key={meeting.meetingId}>
                  <td className="table-td">{startIndex + index + 1}</td>
                  <td className="table-td">{meeting.title}</td>
                  <td className="table-td">
                    {formatDateTime(meeting.meetingTime)}
                  </td>
                  <td className="table-td">{meeting.location || "-"}</td>
                  <td className="table-td">{meeting.attendeeCount || 0}</td>
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
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteMeeting(meeting.meetingId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {totalItems === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, totalItems)} trên {totalItems}
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
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
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

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

// Modal tạo lịch họp
function CreateMeetingModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [meetingTime, setMeetingTime] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [showInternModal, setShowInternModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Tiêu đề không được để trống";
    if (!meetingTime) errors.meetingTime = "Vui lòng chọn thời gian họp";
    if (!location.trim()) errors.location = "Địa điểm không được để trống";
    if (selectedInterns.length === 0)
      errors.attendees = "Vui lòng chọn ít nhất 1 thực tập sinh";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onCreate({
      title: title.trim(),
      meetingTime: meetingTime.format("YYYY-MM-DDTHH:mm:ss"),
      location: location.trim(),
      description: description.trim() || "",
      attendeeIds: selectedInterns.map(
        (intern) => intern.intern_id || intern.id
      ),
    });
  };

  const handleRemoveIntern = (internId) => {
    setSelectedInterns((prev) =>
      prev.filter((i) => (i.intern_id || i.id) !== internId)
    );
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
            <label htmlFor="title">Tiêu đề cuộc họp *</label>
            <input
              id="title"
              type="text"
              className={`form-input ${
                validationErrors.title ? "input-error" : ""
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Họp tổng kết tháng"
            />
            {validationErrors.title && (
              <div className="error-message">{validationErrors.title}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meeting-time">Thời gian họp *</label>
              <DatePicker
                id="meeting-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={meetingTime}
                onChange={(value) => setMeetingTime(value)}
                className="app-date-picker"
                status={validationErrors.meetingTime ? "error" : undefined}
                placeholder="Chọn ngày và giờ"
              />
              {validationErrors.meetingTime && (
                <div className="error-message">
                  {validationErrors.meetingTime}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="location">Địa điểm *</label>
              <input
                id="location"
                type="text"
                className={`form-input ${
                  validationErrors.location ? "input-error" : ""
                }`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Phòng họp A, Tầng 3"
              />
              {validationErrors.location && (
                <div className="error-message">{validationErrors.location}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả cuộc họp</label>
            <textarea
              id="description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung, chương trình cuộc họp..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Người tham dự *</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowInternModal(true)}
              style={{ width: "100%" }}
            >
              + Thêm thực tập sinh
            </button>
            {validationErrors.attendees && (
              <div className="error-message">{validationErrors.attendees}</div>
            )}
          </div>

          {selectedInterns.length > 0 && (
            <div className="selected-interns-list">
              <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                Đã chọn ({selectedInterns.length}):
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedInterns.map((intern) => (
                  <div
                    key={intern.intern_id || intern.id}
                    className="intern-chip"
                  >
                    <span>{intern.student}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveIntern(intern.intern_id || intern.id)
                      }
                      className="chip-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo lịch họp
            </button>
          </div>
        </form>

        {showInternModal && (
          <div className="intern-selection-modal-overlay">
            <div className="intern-selection-modal">
              <InternSelectionModal
                onClose={() => setShowInternModal(false)}
                onSelect={(intern) => {
                  const internId = intern.intern_id || intern.id;
                  if (
                    !selectedInterns.find(
                      (i) => (i.intern_id || i.id) === internId
                    )
                  ) {
                    setSelectedInterns((prev) => [...prev, intern]);
                  }
                  setShowInternModal(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Modal chỉnh sửa lịch họp
function EditMeetingModal({ meeting, onClose, onUpdate }) {
  const [title, setTitle] = useState(meeting.title || "");
  const [meetingTime, setMeetingTime] = useState(
    meeting.meetingTime ? dayjs(meeting.meetingTime) : null
  );
  const [location, setLocation] = useState(meeting.location || "");
  const [description, setDescription] = useState(meeting.description || "");
  const [status, setStatus] = useState(meeting.status || "scheduled");
  const [selectedInterns, setSelectedInterns] = useState(
    meeting.attendees || []
  );
  const [showInternModal, setShowInternModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Tiêu đề không được để trống";
    if (!meetingTime) errors.meetingTime = "Vui lòng chọn thời gian họp";
    if (!location.trim()) errors.location = "Địa điểm không được để trống";
    if (selectedInterns.length === 0)
      errors.attendees = "Vui lòng chọn ít nhất 1 thực tập sinh";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onUpdate({
      title: title.trim(),
      meetingTime: meetingTime.format("YYYY-MM-DDTHH:mm:ss"),
      location: location.trim(),
      description: description.trim() || "",
      status,
      attendeeIds: selectedInterns.map(
        (intern) => intern.intern_id || intern.id
      ),
    });
  };

  const handleRemoveIntern = (internId) => {
    setSelectedInterns((prev) =>
      prev.filter((i) => (i.intern_id || i.id) !== internId)
    );
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
            <label htmlFor="edit-title">Tiêu đề cuộc họp *</label>
            <input
              id="edit-title"
              type="text"
              className={`form-input ${
                validationErrors.title ? "input-error" : ""
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {validationErrors.title && (
              <div className="error-message">{validationErrors.title}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-time">Thời gian họp *</label>
              <DatePicker
                id="edit-time"
                showTime
                format="YYYY-MM-DD HH:mm"
                value={meetingTime}
                onChange={(value) => setMeetingTime(value)}
                className="app-date-picker"
                status={validationErrors.meetingTime ? "error" : undefined}
              />
              {validationErrors.meetingTime && (
                <div className="error-message">
                  {validationErrors.meetingTime}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-location">Địa điểm *</label>
              <input
                id="edit-location"
                type="text"
                className={`form-input ${
                  validationErrors.location ? "input-error" : ""
                }`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              {validationErrors.location && (
                <div className="error-message">{validationErrors.location}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-status">Trạng thái</label>
              <select
                id="edit-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Mô tả</label>
              <textarea
                id="edit-description"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Người tham dự *</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowInternModal(true)}
              style={{ width: "100%" }}
            >
              + Thêm thực tập sinh
            </button>
            {validationErrors.attendees && (
              <div className="error-message">{validationErrors.attendees}</div>
            )}
          </div>

          {selectedInterns.length > 0 && (
            <div className="selected-interns-list">
              <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                Đã chọn ({selectedInterns.length}):
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedInterns.map((intern) => (
                  <div
                    key={intern.intern_id || intern.id}
                    className="intern-chip"
                  >
                    <span>{intern.student}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveIntern(intern.intern_id || intern.id)
                      }
                      className="chip-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Cập nhật
            </button>
          </div>
        </form>

        {showInternModal && (
          <div className="intern-selection-modal-overlay">
            <div className="intern-selection-modal">
              <InternSelectionModal
                onClose={() => setShowInternModal(false)}
                onSelect={(intern) => {
                  const internId = intern.intern_id || intern.id;
                  if (
                    !selectedInterns.find(
                      (i) => (i.intern_id || i.id) === internId
                    )
                  ) {
                    setSelectedInterns((prev) => [...prev, intern]);
                  }
                  setShowInternModal(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Modal xem chi tiết lịch họp
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
            <label>Tiêu đề:</label>
            <div>{meeting.title}</div>
          </div>
          <div className="detail-row">
            <label>Thời gian:</label>
            <div>{formatDateTime(meeting.meetingTime)}</div>
          </div>
          <div className="detail-row">
            <label>Địa điểm:</label>
            <div>{meeting.location || "-"}</div>
          </div>
          <div className="detail-row">
            <label>Trạng thái:</label>
            <div>
              {meeting.status === "scheduled"
                ? "Đã lên lịch"
                : meeting.status === "completed"
                ? "Đã hoàn thành"
                : "Đã hủy"}
            </div>
          </div>
          <div className="detail-row">
            <label>Mô tả:</label>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {meeting.description || "Không có mô tả"}
            </div>
          </div>
          <div className="detail-row">
            <label>Người tham dự ({meeting.attendeeCount || 0}):</label>
            <div>
              {meeting.attendees && meeting.attendees.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {meeting.attendees.map((attendee, idx) => (
                    <li key={idx}>{attendee.student || attendee.name}</li>
                  ))}
                </ul>
              ) : (
                <span>Chưa có người tham dự</span>
              )}
            </div>
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
