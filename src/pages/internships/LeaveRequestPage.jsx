// src/pages/internships/LeaveRequestPage.jsx - Chuẩn hóa
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LeaveRequestPage.css";
import { useAuthStore } from "../../store/authStore";
import {
  getLeaveRequests,
  createLeaveRequest,
  cancelLeaveRequest,
} from "../../services/leaveRequestService";

const { RangePicker } = DatePicker;

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const currentUser = useAuthStore((state) => state.user);
  const [notification, setNotification] = useState(null);

  // Load data when component mounts or when page changes
  useEffect(() => {
    loadLeaveRequests();
  }, [currentPage]);

  // Reset to first page when component unmounts
  useEffect(() => {
    return () => {
      setCurrentPage(1);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate window of pages around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're at the start or end
    if (currentPage <= 3) {
      endPage = 4;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 3;
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  async function loadLeaveRequests() {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getLeaveRequests(currentUser.email, {
        page: currentPage - 1, // Convert to 0-based for API
        size: pageSize,
      });

      let userRequests = [];
      let total = 0;

      if (response && response.data) {
        // Handle both array and paginated response
        if (Array.isArray(response.data)) {
          userRequests = response.data;
        } else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          // Handle Spring Data Page response
          userRequests = response.data.content;
        }
      }

      // Filter by current user email (as a fallback)
      const currentEmail = currentUser.email.toLowerCase();
      userRequests = userRequests.filter((req) => {
        const internEmail = (req.internEmail || "").toLowerCase();
        return internEmail === currentEmail;
      });

      setRequests(userRequests);
      setTotalItems(total || userRequests.length);
    } catch (error) {
      console.error("Error loading leave requests:", error);
      setNotification({
        type: "error",
        message: "Không thể tải danh sách nghỉ phép",
        details: error?.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle create request success
  async function handleCreateRequest(data) {
    try {
      await createLeaveRequest(data);
      setNotification({
        type: "success",
        message: "Gửi yêu cầu nghỉ phép thành công! ",
        details: `Từ ${dayjs(data.startDate).format("DD/MM/YYYY")} đến ${dayjs(
          data.endDate
        ).format("DD/MM/YYYY")}`,
      });

      setShowCreate(false);
      setCurrentPage(1); // Reset to first page after creating new request
      await loadLeaveRequests();
    } catch (error) {
      console.error("Error creating leave request:", error);
      setNotification({
        type: "error",
        message: "Tạo yêu cầu thất bại",
        details:
          error?.response?.data?.message ||
          error?.message ||
          "Vui lòng kiểm tra lại thông tin",
      });
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      PENDING: { text: "Đang chờ", class: "badge-pending" },
      APPROVED: { text: "Đã duyệt", class: "badge-approved" },
      REJECTED: { text: "Từ chối", class: "badge-rejected" },
      pending: { text: "Đang chờ", class: "badge-pending" },
      approved: { text: "Đã duyệt", class: "badge-approved" },
      rejected: { text: "Từ chối", class: "badge-rejected" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "badge-pending",
    };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  }

  // Calculate days between two dates
  function calculateDays(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, "day") + 1;
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = requests; // Already paginated by the API

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="page-container">


      <div className="page-header">
        <h1 className="page-title">📋 Đăng ký nghỉ phép</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          ➕ Tạo yêu cầu mới
        </button>
      </div>

      {/* Inline Notification */}
      {notification && (
        <InlineNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {
                requests.filter(
                  (r) => r.status === "PENDING" || r.status === "pending"
                ).length
              }
            </div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {
                requests.filter(
                  (r) => r.status === "APPROVED" || r.status === "approved"
                ).length
              }
            </div>
            <div className="stat-label">Đã duyệt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-rejected-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value stat-rejected-value">
              {
                requests.filter(
                  (r) => r.status === "REJECTED" || r.status === "rejected"
                ).length
              }
            </div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        {requests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">Bạn chưa có yêu cầu nghỉ phép nào</div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
            >
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-th">STT</th>
                    <th className="table-th">Thời gian</th>
                    <th className="table-th">Số ngày</th>
                    <th className="table-th">Lý do</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Phản hồi</th>
                    <th className="table-th">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((request, index) => (
                    <tr key={request.id}>
                      <td className="table-td center">
                        {startIndex + index + 1}
                      </td>
                      <td className="table-td">
                        {dayjs(request.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(request.endDate).format("DD/MM/YYYY")}
                      </td>
                      <td className="table-td center">
                        {request.leaveDays ||
                          calculateDays(
                            request.startDate,
                            request.endDate
                          )}{" "}
                        ngày
                      </td>
                      <td className="table-td">
                        <div className="reason-text">{request.reason}</div>
                      </td>
                      <td className="table-td center">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="table-td">
                        {request.approvalReason ||
                          request.rejectionReason ||
                          "-"}
                      </td>
                      <td className="table-td">
                        {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Hiển thị {startIndex + 1}–
                  {Math.min(startIndex + pageSize, totalItems)} trên{" "}
                  {totalItems}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="Về trang đầu"
                  >
                    « Đầu
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    ‹ Trước
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`dots-${idx}`} className="page-dots">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`btn btn-sm page-btn ${
                          page === currentPage ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    className="btn btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    title="Trang sau"
                  >
                    Sau ›
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Đến trang cuối"
                  >
                    Cuối »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Leave Request Modal */}
      {showCreate && (
        <CreateLeaveRequestModal
          currentUser={currentUser}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateRequest}
        />
      )}
    </div>
  );
}

// Inline Notification Component
function InlineNotification({ type, message, details, onClose }) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`inline-notification ${type}`}>
      <div className="notification-icon">{icons[type]}</div>
      <div className="notification-content">
        <div className="notification-title">{message}</div>
        {details && <div className="notification-details">{details}</div>}
      </div>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function CreateLeaveRequestModal({ currentUser, onClose, onCreate }) {
  const [dateRange, setDateRange] = useState(null);
  const [reason, setReason] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      errors.dateRange = "Vui lòng chọn thời gian nghỉ";
    }
    if (!reason.trim()) errors.reason = "Vui lòng nhập lý do nghỉ";
    if (reason.trim().length < 10) {
      errors.reason = "Lý do phải có ít nhất 10 ký tự";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!currentUser?.email) {
      toast.error("Không xác định được người dùng. Vui lòng đăng nhập lại");
      return;
    }

    const data = {
      email: currentUser.email,
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
      reason: reason.trim(),
    };

    onCreate(data);
  };

  const handleInputChange = (setter, field) => (value) => {
    setter(value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo yêu cầu nghỉ phép</h2>
          <button className="modal-close-btn btn- " onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Thời gian nghỉ <span className="required">*</span>
              </label>
              <RangePicker
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={handleInputChange(setDateRange, "dateRange")}
                className="form-date-range"
                status={validationErrors.dateRange ? "error" : undefined}
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("day");
                }}
              />
              {validationErrors.dateRange && (
                <div className="error-message">
                  {validationErrors.dateRange}
                </div>
              )}
              {dateRange && dateRange[0] && dateRange[1] && (
                <div className="date-info">
                  Tổng số ngày nghỉ:{" "}
                  <strong>
                    {dateRange[1].diff(dateRange[0], "day") + 1} ngày
                  </strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Lý do nghỉ <span className="required">*</span>
              </label>
              <textarea
                className={`form-textarea ${
                  validationErrors.reason ? "input-error" : ""
                }`}
                value={reason}
                onChange={(e) =>
                  handleInputChange(setReason, "reason")(e.target.value)
                }
                placeholder="Nhập lý do nghỉ phép của bạn (tối thiểu 10 ký tự)"
                rows={4}
              />
              <div className="char-count">{reason.length} / 500 ký tự</div>
              {validationErrors.reason && (
                <div className="error-message">{validationErrors.reason}</div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
