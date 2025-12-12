import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { updateTaskStatus } from "../../services/taskService";
import "./MyTasks.css";

// Priority mapping
const PRIORITY_MAP = {
  HIGH: { label: "Cao", class: "priority-high" },
  MEDIUM: { label: "Trung bình", class: "priority-medium" },
  LOW: { label: "Thấp", class: "priority-low" },
};

// Status mapping
const STATUS_MAP = {
  NEW: { label: "Chưa bắt đầu", class: "status-pending" },
  IN_PROGRESS: { label: "Đang thực hiện", class: "status-progress" },
  COMPLETED: { label: "Hoàn thành", class: "status-done" },
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const getUserId = () => {
    // Try multiple ways to get userId

    // Method 1: From localStorage "auth-storage" (Zustand)
    const authStorageStr = localStorage.getItem("auth-storage");
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        if (authStorage.state?.user?.id) {
          return authStorage.state.user.id;
        }
      } catch (e) {
        console.error("Error parsing auth-storage:", e);
      }
    }

    // Method 2: From localStorage "user"
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.userId || user.id || user.user_id || user.USER_ID;
        if (userId) return userId;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    // Method 3: Direct from localStorage "userId"
    const userIdDirect = localStorage.getItem("userId");
    if (userIdDirect) return userIdDirect;

    return null;
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const userId = getUserId();

      if (!userId) {
        toast.error(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
        console.error("Cannot find userId in localStorage");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://codeft.duckdns.org:8090/api/tasks/my-tasks?userId=${userId}`
      );

      if (response.data.success) {
        setTasks(response.data.data || []);
        if (response.data.data?.length > 0) {
          toast.success(`Đã tải ${response.data.data.length} công việc`);
        } else {
          toast.info("Bạn chưa có công việc nào được giao");
        }
      } else {
        toast.error(
          response.data.message || "Không thể tải danh sách công việc."
        );
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);

      if (error.response) {
        toast.error(
          error.response.data.message || "Không thể tải danh sách công việc."
        );
      } else if (error.request) {
        toast.error("Không thể kết nối đến server.");
      } else {
        toast.error("Đã xảy ra lỗi: " + error.message);
      }

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      const response = await updateTaskStatus(taskId, newStatus);

      if (response.success) {
        toast.success("Cập nhật trạng thái thành công!");
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái.");
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái công việc.");
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getPriorityInfo = (priority) => {
    return PRIORITY_MAP[priority] || { label: priority, class: "priority-low" };
  };

  const getStatusInfo = (status) => {
    return STATUS_MAP[status] || { label: status, class: "status-pending" };
  };

  if (loading) {
    return (
      <div className="page-container mytasks-container">
        <div className="loading center">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="page-header">
        <h1 className="page-title mytasks-title">Công việc của tôi</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📋</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Tổng nhiệm vụ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-wait-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-wait-value">
              {
                tasks.filter(
                  (t) => t.status === "PENDING" || t.status === "NEW"
                ).length
              }
            </div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {tasks.filter((t) => t.status === "IN_PROGRESS").length}
            </div>
            <div className="stat-label">Đang thực hiện</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {tasks.filter((t) => t.status === "COMPLETED").length}
            </div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
      </div>

      <div className="card">
        {tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            <div className="empty-text">
              Bạn chưa có công việc nào được giao
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table mytasks-table">
              <thead>
                <tr>
                  <th className="table-th">Tên công việc</th>
                  <th className="table-th">Mô tả</th>
                  <th className="table-th">Ưu tiên</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Hạn chót</th>
                  <th className="table-th center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const priorityInfo = getPriorityInfo(task.priority);
                  const statusInfo = getStatusInfo(task.status);

                  return (
                    <tr key={task.id}>
                      <td className="table-td">
                        <strong>{task.title}</strong>
                      </td>
                      <td className="table-td">{task.description || "-"}</td>
                      <td className="table-td">
                        <span
                          className={`priority-badge ${priorityInfo.class}`}
                        >
                          {priorityInfo.label}
                        </span>
                      </td>
                      <td className="table-td">
                        <span
                          className={`mytasks-status-badge ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="mytasks-deadline">
                          {formatDate(task.dueDate)}
                        </span>
                      </td>
                      <td className="table-td mytasks-action-cell">
                        <div className="mytasks-btn-group">
                          <button
                            className={`mytasks-status-btn ${
                              task.status === "NEW" ? "active" : ""
                            }`}
                            onClick={() => handleStatusChange(task.id, "NEW")}
                            disabled={updating}
                            title="Chưa bắt đầu"
                          >
                            <span className="mytasks-status-dot new"></span>
                          </button>
                          <button
                            className={`mytasks-status-btn ${
                              task.status === "IN_PROGRESS" ? "active" : ""
                            }`}
                            onClick={() =>
                              handleStatusChange(task.id, "IN_PROGRESS")
                            }
                            disabled={updating}
                            title="Đang thực hiện"
                          >
                            <span className="mytasks-status-dot in-progress"></span>
                          </button>
                          <button
                            className={`mytasks-status-btn ${
                              task.status === "COMPLETED" ? "active" : ""
                            }`}
                            onClick={() =>
                              handleStatusChange(task.id, "COMPLETED")
                            }
                            disabled={updating}
                            title="Hoàn thành"
                          >
                            <span className="mytasks-status-dot completed"></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
