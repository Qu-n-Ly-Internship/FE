import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/adminService";
import "./admin.css";

const ROLES = ["HR", "MENTOR", "INTERN", "USER"];
const STATUSES = ["ACTIVE", "PENDING", "INACTIVE"];

export default function Users() {
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr] = useState("");
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    load();
  }, [q, filterRole, filterStatus, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, filterRole, filterStatus]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await getUsers({
        q,
        role: filterRole,
        status: filterStatus,
        page: currentPage - 1,
        size: pageSize,
      });

      setItems(res.content || []);
      setTotal(res.totalElements || res.total || res.content?.length || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateUser(id, field, value) {
    setSavingId(id);
    try {
      const user = items.find((u) => u.id === id);
      await updateUser({ ...user, [field]: value });
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
      );

      setNotification({
        type: "success",
        message: "Cập nhật thành công",
        details: `Đã cập nhật ${
          field === "role" ? "vai trò" : "trạng thái"
        } của ${user.fullName}`,
      });
    } catch (e) {
      setNotification({
        type: "error",
        message: "Cập nhật thất bại",
        details: e?.response?.data?.message || "Vui lòng thử lại",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function onCreate(data) {
    try {
      await createUser(data);

      setNotification({
        type: "success",
        message: "Tạo tài khoản thành công! 🎉",
        details: `${data.fullName} - ${data.email}`,
      });

      setShowCreate(false);
      await load();
    } catch (e) {
      setNotification({
        type: "error",
        message: "Tạo tài khoản thất bại",
        details: e?.response?.data?.message || "Vui lòng thử lại",
      });
    }
  }

  async function onDelete(id) {
    const user = items.find((u) => u.id === id);
    if (!window.confirm(`Xác nhận xóa người dùng "${user?.fullName}"?`)) return;

    try {
      await deleteUser(id);

      setNotification({
        type: "warning",
        message: "Đã xóa người dùng",
        details: `${user?.fullName} đã bị xóa khỏi hệ thống`,
      });

      await load();
    } catch (e) {
      setNotification({
        type: "error",
        message: "Xóa thất bại",
        details: e?.response?.data?.message || "Vui lòng thử lại",
      });
    }
  }

  function clearFilters() {
    setQ("");
    setFilterRole("");
    setFilterStatus("");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;

  function getPageNumbers() {
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
  }

  return (
    <div className="page-container admin-container">
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
        <h1 className="page-title admin-title">Quản lý người dùng</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          Thêm người dùng
        </button>
      </div>

      {notification && (
        <InlineNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tìm kiếm (Tên/Email)</label>
            <input
              className="form-input"
              placeholder="Nhập họ tên hoặc email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select
              className="form-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
        <div className="admin-total" style={{ marginTop: "12px" }}>
          Tổng: {total} người dùng
        </div>
      </div>

      {err && <div className="admin-alert">{err}</div>}

      {/* Table */}
      <div className="card admin-card">
        {loading ? (
          <div className="loading center">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <div className="empty-text">Không tìm thấy người dùng</div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table admin-table">
                <thead>
                  <tr className="admin-thead-row">
                    <th className="table-th admin-th">STT</th>
                    <th className="table-th admin-th">Họ tên</th>
                    <th className="table-th admin-th">Email</th>
                    <th className="table-th admin-th">Vai trò</th>
                    <th className="table-th admin-th">Trạng thái</th>
                    <th className="table-th admin-th">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u, index) => (
                    <tr key={u.id} className="admin-tr">
                      <td className="table-td admin-td center">
                        {startIndex + index + 1}
                      </td>
                      <td className="table-td admin-td">
                        <strong>{u.fullName}</strong>
                      </td>
                      <td className="table-td admin-td">{u.email}</td>
                      <td className="table-td admin-td">
                        {u.role === "ADMIN" ? (
                          <span className="admin-role-display">ADMIN</span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={savingId === u.id}
                            onChange={(e) =>
                              onUpdateUser(u.id, "role", e.target.value)
                            }
                            className="form-select admin-select--sm"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="table-td admin-td">
                        {u.role === "ADMIN" ? (
                          <span className="admin-status-display">ACTIVE</span>
                        ) : (
                          <select
                            value={u.status}
                            disabled={savingId === u.id}
                            onChange={(e) =>
                              onUpdateUser(u.id, "status", e.target.value)
                            }
                            className="form-select admin-select--sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="table-td admin-td">
                        <button
                          onClick={() => onDelete(u.id)}
                          className="btn btn-danger btn-lg"
                          disabled={u.role === "ADMIN"}
                        >
                          Xóa
                        </button>
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
                  Hiển thị {items.length === 0 ? 0 : startIndex + 1}–
                  {startIndex + items.length} trên {total}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-sm btn-secondary"
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
                    className="btn btn-sm  btn-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}

// Inline Notification Component
function InlineNotification({ type, message, details, onClose }) {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const colors = {
    success: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    error: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    warning: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        padding: "16px 20px",
        borderRadius: "8px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <div style={{ fontSize: "24px", flexShrink: 0 }}>{icons[type]}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: "600",
            color: style.text,
            fontSize: "16px",
            marginBottom: "4px",
          }}
        >
          {message}
        </div>
        {details && (
          <div style={{ color: style.text, fontSize: "14px", opacity: 0.8 }}>
            {details}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: style.text,
          cursor: "pointer",
          fontSize: "20px",
          padding: "0",
          lineHeight: "1",
          opacity: 0.6,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
      >
        ×
      </button>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// Create User Modal
function CreateUserModal({ onClose, onCreate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("INTERN");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const validateFullName = (value) =>
    !value.trim() ? "Họ tên không được để trống" : "";

  const validateEmail = (value) => {
    if (!value.trim()) return "Email không được để trống";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Email không đúng định dạng";
  };

  const validatePassword = (value) => {
    if (!value) return "Mật khẩu không được để trống";
    return value.length < 6 ? "Mật khẩu phải có tối thiểu 6 ký tự" : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullNameError = validateFullName(fullName);
    let emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (fullNameError || emailError || passwordError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
      });
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setSubmitting(true);
    try {
      const { total } = await getUsers({ q: email.trim() });
      if (total > 0) {
        emailError = "Email này đã được sử dụng.";
      }
    } catch (error) {
      console.error("Email check failed:", error);
    }

    if (emailError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
      });
      toast.error("Email này đã được sử dụng");
      setSubmitting(false);
      return;
    }

    try {
      await onCreate({ fullName, email, role, password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Họ tên <span className="required">*</span>
            </label>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({
                  ...p,
                  fullName: validateFullName(e.target.value),
                }));
              }}
              className={`form-input ${errors.fullName ? "input-error" : ""}`}
            />
            {errors.fullName && (
              <div className="error-message">{errors.fullName}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({
                  ...p,
                  email: validateEmail(e.target.value),
                }));
              }}
              className={`form-input ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Mật khẩu <span className="required">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({
                  ...p,
                  password: validatePassword(e.target.value),
                }));
              }}
              className={`form-input ${errors.password ? "input-error" : ""}`}
            />

            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            <div className="form-row">
              <div className="form-hint">Tối thiểu 6 ký tự</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
