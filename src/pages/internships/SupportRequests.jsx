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

  // Filter trên client-side
  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "ALL") return true;
    return req.status === filterStatus;
  });

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

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
                {filteredRequests.map((req, index) => (
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
