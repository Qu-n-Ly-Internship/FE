import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import { assignTask, getAssignedTasks } from "../../services/taskService";
import "./TaskManagement.css";

// Import Vietnamese locale
import "dayjs/locale/vi";
dayjs.locale("vi");

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "",
    internId: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getAssignedTasks();
      console.log("DEBUG: raw assigned tasks from API:", data);

      // Normalize task data
      const normalized = (data || []).map((t) => {
        const id = t.id || t.taskId || t.task_id;
        const title = t.title || t.name || "";
        const description = t.description || t.desc || "";
        const duedate =
          t.duedate ||
          t.due_date ||
          t.due ||
          (t.schedule && (t.schedule.date || t.schedule.dateTime)) ||
          null;
        const assignedAt =
          t.assignedAt ||
          t.assigned_at ||
          t.createdAt ||
          t.created_at ||
          t.assignedAtTime ||
          null;
        const internName =
          t.internName ||
          t.intern_name ||
          (t.intern && (t.intern.fullname || t.intern.name)) ||
          (t.assignedTo && (t.assignedTo.fullname || t.assignedTo.name)) ||
          "";
        const internEmail =
          t.internEmail ||
          t.intern_email ||
          (t.intern && (t.intern.email || t.internEmail)) ||
          "";
        const status = t.status || t.state || "UNKNOWN";
        const priority = t.priority || t.prio || null;

        return {
          raw: t,
          id,
          title,
          description,
          duedate,
          assignedAt,
          internName,
          internEmail,
          status,
          priority,
        };
      });

      setTasks(normalized);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setFormData((prev) => ({
      ...prev,
      internId: intern.intern_id || intern.id,
    }));
    setShowInternModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      priority: "",
      internId: "",
    });
    setSelectedIntern(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      priority: "",
      internId: "",
    });
    setSelectedIntern(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.due_date ||
      !formData.internId
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await assignTask(formData);
      toast.success("Giao nhiệm vụ thành công! 🎉");
      handleCloseModal();
      loadTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi giao nhiệm vụ"
      );
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "-";

    if (typeof dateInput === "object" && dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return "-";
      return dateInput.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const d = dayjs(dateInput);
    if (d.isValid()) {
      return d.format("D MMMM, YYYY");
    }

    const native = new Date(dateInput);
    if (!isNaN(native.getTime())) {
      return native.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return String(dateInput);
  };

  const getStatusBadge = (task) => {
    const due = new Date(task.duedate || task.dueDate);
    const now = new Date();
    let effectiveStatus = task.status;

    if (
      task.status !== "COMPLETED" &&
      due instanceof Date &&
      !isNaN(due.getTime()) &&
      due < now
    ) {
      effectiveStatus = "OVERDUE";
    }

    const statusMap = {
      PENDING: { class: "badge-pending", label: "Chờ xử lý" },
      NEW: { class: "badge-pending", label: "Chưa bắt đầu" },
      IN_PROGRESS: { class: "badge-approved", label: "Đang thực hiện" },
      COMPLETED: { class: "badge-completed", label: "Đã hoàn thành" },
      OVERDUE: { class: "badge-rejected", label: "Quá hạn" },
    };

    const statusInfo = statusMap[effectiveStatus] || {
      class: "badge",
      label: effectiveStatus || "-",
    };

    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
    );
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý Nhiệm vụ</h1>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          ➕ Giao nhiệm vụ mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📋</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Tổng nhiệm vụ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
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
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
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

      {/* Task List */}
      <div className="card">
        <h2
          style={{
            marginBottom: "var(--spacing-xl)",
            fontSize: "var(--font-size-xl)",
          }}
        >
          Danh sách nhiệm vụ đã giao
        </h2>
        {loading ? (
          <div className="loading center">Đang tải dữ liệu...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">Chưa có nhiệm vụ nào được giao</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">Tiêu đề</th>
                  <th className="table-th">Thực tập sinh</th>
                  <th className="table-th">Hạn chót</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày giao</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="table-td">
                      <div className="task-title">{task.title}</div>
                      <div className="task-description">{task.description}</div>
                    </td>
                    <td className="table-td">
                      <div className="intern-info">
                        <div className="intern-name">{task.internName}</div>
                        <div className="intern-email">{task.internEmail}</div>
                      </div>
                    </td>
                    <td className="table-td">{formatDate(task.duedate)}</td>
                    <td className="table-td center">{getStatusBadge(task)}</td>
                    <td className="table-td">{formatDate(task.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Assignment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Giao nhiệm vụ mới</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleSubmit} className="task-form" noValidate>
                <div className="form-group">
                  <label className="form-label">
                    Chọn thực tập sinh <span className="required">*</span>
                  </label>
                  <div
                    className="intern-selector"
                    onClick={() => setShowInternModal(true)}
                  >
                    {selectedIntern ? (
                      <div className="selected-intern">
                        <span>{selectedIntern.student}</span>
                        <span className="text-muted">
                          {selectedIntern.studentEmail}
                        </span>
                      </div>
                    ) : (
                      <div className="select-placeholder">
                        Nhấn để chọn thực tập sinh
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Tiêu đề nhiệm vụ <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề nhiệm vụ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Mô tả chi tiết <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Mô tả chi tiết nhiệm vụ..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority" className="form-label">
                    Độ ưu tiên <span className="required">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn độ ưu tiên --</option>
                    <option value="1">1 - Cao</option>
                    <option value="2">2 - Trung bình</option>
                    <option value="3">3 - Thấp</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Hạn chót <span className="required">*</span>
                  </label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn thời hạn"
                    value={formData.due_date ? dayjs(formData.due_date) : null}
                    onChange={(date) => {
                      setFormData((prev) => ({
                        ...prev,
                        due_date: date ? date.format("YYYY-MM-DDTHH:mm") : "",
                      }));
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Giao nhiệm vụ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Intern Selection Modal */}
      {showInternModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={() => setShowInternModal(false)}
        >
          <div
            className="modal-box"
            style={{ zIndex: 1101 }}
            onClick={(e) => e.stopPropagation()}
          >
            <InternSelectionModal
              onClose={() => setShowInternModal(false)}
              onSelect={handleSelectIntern}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
