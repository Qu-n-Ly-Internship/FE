// src/pages/internships/SupportRequests.jsx - Chuẩn hóa
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMySupportRequests } from "../../services/supportRequestService";
import NewRequestModal from "../../components/common/NewRequestModal";
import "./SupportRequests.css";

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
      config = { text: "Đã xác nhận", className: "badge-approved" };
      break;
    case "REJECTED":
      config = { text: "Bị từ chối", className: "badge-rejected" };
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

export default function SupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getMySupportRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
      toast.error(err.message || "Không thể tải danh sách yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestCreated = () => {
    loadRequests();
    toast.success("Tạo yêu cầu thành công! 🎉");
  };

  // Reset về trang đầu khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Filter trên client-side
  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "ALL") return true;
    return req.status === filterStatus;
  });

  // Tính toán phân trang
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filteredRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  // Hàm tạo số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (n) => pages.push(n);
    add(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) add(i);
    if (right < totalPages - 1) pages.push("...");
    add(totalPages);
    return pages;
  };

  return (
    <div className="page-container">


      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📬 Yêu cầu hỗ trợ của tôi</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Tạo yêu cầu mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📋</div>
          <div className="stat-info">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {requests.filter((r) => r.status === "PENDING").length}
            </div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {requests.filter((r) => r.status === "COMPLETED").length}
            </div>
            <div className="stat-label">Đã xác nhận</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-rejected-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value stat-rejected-value">
              {requests.filter((r) => r.status === "REJECTED").length}
            </div>
            <div className="stat-label">Bị từ chối</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card ">
        <div className="filters-grid">
          <div className="form-group ">
            <label htmlFor="statusFilter" className="form-label">
              Lọc theo trạng thái:
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="COMPLETED">Đã xác nhận</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading center">Đang tải...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📬</div>
            <div className="empty-text">
              {filterStatus === "ALL"
                ? "Bạn chưa có yêu cầu nào"
                : "Không có yêu cầu nào phù hợp"}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">STT</th>
                  <th className="table-th">Tiêu đề</th>
                  <th className="table-th">Nội dung</th>
                  <th className="table-th">Độ ưu tiên</th>
                  <th className="table-th">Ngày gửi</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Phản hồi</th>
                  <th className="table-th">File đính kèm</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((req, index) => (
                  <tr key={req.id}>
                    <td className="table-td center">{index + 1}</td>
                    <td className="table-td">
                      <strong>{req.subject}</strong>
                    </td>
                    <td className="table-td request-description">
                      {req.message?.length > 100
                        ? req.message.substring(0, 100) + "..."
                        : req.message}
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
                        ? new Date(req.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="table-td center">
                      <RequestStatusBadge status={req.status} />
                    </td>
                    <td className="table-td">
                      {req.hrResponse ? (
                        <div className="request-response">
                          <strong>HR:</strong> {req.hrResponse}
                        </div>
                      ) : req.status === "COMPLETED" ||
                        req.status === "REJECTED" ? (
                        <i style={{ color: "var(--text-muted)" }}>
                          Không có phản hồi
                        </i>
                      ) : (
                        <i style={{ color: "var(--text-muted)" }}>
                          Chưa có phản hồi
                        </i>
                      )}
                    </td>
                    <td className="table-td center">
                      {req.attachmentFileId ? (
                        <a
                          href={req.attachmentFileId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📎 Xem file
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Hiển thị {currentItems.length === 0 ? 0 : startIndex + 1}–
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    title="Trang sau"
                  >
                    Sau ›
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Đến trang cuối"
                  >
                    Cuối »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <NewRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={handleRequestCreated}
        />
      )}
    </div>
  );
}
