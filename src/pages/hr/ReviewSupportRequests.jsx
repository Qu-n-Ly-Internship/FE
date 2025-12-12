// src/pages/hr/ReviewSupportRequests.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllSupportRequests,
  getSupportRequestsByStatus,
} from "../../services/supportRequestService";
import SupportRequestReviewModal from "../../components/hr/SupportRequestReviewModal";
import "./ReviewSupportRequests.css";

// Component Status Badge
function RequestStatusBadge({ status }) {
  let config = {
    text: status || "Unknown",
    className: "status-default",
  };
  switch (status) {
    case "PENDING":
      config = { text: "Chờ xử lý", className: "badge-pending" };
      break;
    case "COMPLETED":
      config = {
        text: "Đã xác nhận",
        className: "badge-approved",
      };
      break;
    case "REJECTED":
      config = { text: "Từ chối", className: "badge-rejected" };
      break;
  }
  return <span className={`badge ${config.className}`}>{config.text}</span>;
}

// Helper để lấy label cho priority
const getPriorityLabel = (priority) => {
  const priorityMap = {
    NORMAL: "Bình thường",
    HIGH: "Cao",
    URGENT: "Khẩn cấp",
  };
  return priorityMap[priority] || priority;
};

export default function ReviewSupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingRequest, setViewingRequest] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters state
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      let data;

      if (filterStatus !== "ALL") {
        // Nếu filter theo status, dùng endpoint riêng (không có pagination)
        const statusData = await getSupportRequestsByStatus(filterStatus);
        data = {
          content: statusData,
          currentPage: 0,
          totalPages: 1,
          totalItems: statusData.length,
        };
      } else {
        // Load tất cả với pagination
        data = await getAllSupportRequests({
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
        });
      }

      if (data && data.content && Array.isArray(data.content)) {
        setRequests(data.content);
        setCurrentPage(data.currentPage || 0);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
      } else {
        console.error("Expected data with content array but got:", data);
        setRequests([]);
        setError("Dữ liệu nhận được không đúng định dạng");
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (err) {
      console.error("Error loading support requests:", err);
      setError(err.message || "Không thể tải danh sách yêu cầu.");
      toast.error(err.message || "Không thể tải danh sách yêu cầu.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus, currentPage, pageSize, sortBy]);

  const handleReviewSuccess = () => {
    loadRequests();
    toast.success("Xử lý yêu cầu thành công!");
  };

  const clearFilters = () => {
    setFilterStatus("ALL");
    setFilterPriority("ALL");
    setSearchTerm("");
    setCurrentPage(0);
  };

  // Client-side filtering cho priority và search
  const filteredRequests = requests.filter((req) => {
    // Filter by priority
    if (filterPriority !== "ALL" && req.priority !== filterPriority) {
      return false;
    }

    // Filter by search term (subject or message)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchSubject = req.subject?.toLowerCase().includes(searchLower);
      const matchMessage = req.message?.toLowerCase().includes(searchLower);
      if (!matchSubject && !matchMessage) {
        return false;
      }
    }

    return true;
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="page-container review-requests-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Duyệt Yêu Cầu Hỗ Trợ</h1>
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadRequests}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "🔄 Làm mới"}
        </button>
      </div>

      {/* Error Alert */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📋</div>
          <div className="stat-info">
            <div className="stat-value">{totalItems}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {
                requests.filter((r) => r.status?.toLowerCase() === "pending")
                  .length
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
                requests.filter((r) => r.status?.toLowerCase() === "completed")
                  .length
              }
            </div>
            <div className="stat-label">Đã giải quyết</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-rejected-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value stat-rejected-value">
              {
                requests.filter((r) => r.status?.toLowerCase() === "rejected")
                  .length
              }
            </div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tìm kiếm:</label>
            <input
              id="searchFilter"
              type="text"
              className="form-input"
              placeholder="Tìm trong tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="statusFilter" className="form-label">
              Trạng thái:
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="COMPLETED">Đã giải quyết</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priorityFilter" className="form-label">
              Độ ưu tiên:
            </label>
            <select
              id="priorityFilter"
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="NORMAL">Bình thường</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sortFilter" className="form-label">
              Sắp xếp:
            </label>
            <select
              id="sortFilter"
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="priority">Độ ưu tiên</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <button className="btn btn-clear" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Request List Table */}
      <div className="card">
        {loading ? (
          <div className="loading center">Đang tải...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔭</div>
            <div className="empty-text">Không có yêu cầu nào phù hợp.</div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table ">
                <thead>
                  <tr>
                    <th className="table-th">STT</th>
                    <th className="table-th">Thực tập sinh</th>
                    <th className="table-th">Tiêu đề</th>
                    <th className="table-th">Nội dung</th>
                    <th className="table-th">Độ ưu tiên</th>
                    <th className="table-th">Ngày gửi</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">File</th>
                    <th className="table-th">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req, index) => (
                    <tr key={req.id}>
                      <td className="table-td center">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="table-td">
                        <strong>{req.internName || "Chưa có thông tin"}</strong>
                        {req.internEmail && (
                          <div className="text-muted">{req.internEmail}</div>
                        )}
                      </td>
                      <td className="table-td">
                        <strong>{req.subject}</strong>
                      </td>
                      <td className="table-td">
                        <div className="reason-text">
                          {req.message?.length > 100
                            ? req.message.substring(0, 100) + "..."
                            : req.message}
                        </div>
                      </td>
                      <td className="table-td">
                        <span
                          className={`priority-badge priority-${req.priority?.toLowerCase()}`}
                        >
                          {getPriorityLabel(req.priority)}
                        </span>
                      </td>
                      <td className="table-td">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="table-td">
                        <RequestStatusBadge status={req.status} />
                      </td>
                      <td className="table-td">
                        {req.attachmentFileId ? (
                          <a
                            href={req.attachmentFileId}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            📎 Xem
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="table-td">
                        <div className="action-buttons">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => setViewingRequest(req)}
                          >
                            Xem/Duyệt
                          </button>
                        </div>
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
                  Hiển thị {totalItems === 0 ? 0 : currentPage * pageSize + 1}–
                  {Math.min((currentPage + 1) * pageSize, totalItems)} trên{" "}
                  {totalItems}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary  btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    ‹ Trước
                  </button>
                  <span className="page-current">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary  btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {viewingRequest && (
        <SupportRequestReviewModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
