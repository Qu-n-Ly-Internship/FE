import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/adminService";

const ROLES = ["ADMIN", "HR", "MENTOR", "INTERN"];
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

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { content, total } = await getUsers({ 
        q, 
        role: filterRole, 
        status: filterStatus 
      });
      setItems(content || []);
      setTotal(total || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, filterRole, filterStatus]);

  async function onUpdateUser(id, field, value) {
    setSavingId(id);
    try {
      const user = items.find(u => u.id === id);
      await updateUser({ ...user, [field]: value });
      setItems(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingId(null);
    }
  }

  async function onCreate(data) {
    try {
      const user = await createUser(data);
      alert("Tạo thành công.");
      setShowCreate(false);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Tạo tài khoản thất bại");
    }
  }

  async function onDelete(id) {
    if (!confirm("Xác nhận xóa người dùng này?")) return;
    try {
      await deleteUser(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Xóa thất bại");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        Quản lý người dùng
      </h1>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Tìm họ tên/email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            width: 280,
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <option value="">Tất cả vai trò</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Thêm người dùng
        </button>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "#666" }}>
          Tổng: {total}
        </div>
      </div>

      {err && (
        <div style={{ color: "#dc3545", marginBottom: 12, padding: "8px 12px", background: "#f8d7da", borderRadius: 4 }}>
          {err}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          overflowX: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead>
            <tr style={{ background: "#f6f6f6", textAlign: "left" }}>
              <Th>Họ tên</Th>
              <Th>Email</Th>
              <Th>Vai trò</Th>
              <Th>Trạng thái</Th>
              <Th style={{ width: 120 }}>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: 12 }}>
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                  Không có dữ liệu.
                </td>
              </tr>
            )}
            {items.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                <Td>{u.fullName}</Td>
                <Td>{u.email}</Td>
                <Td>
                  <select
                    value={u.role}
                    disabled={savingId === u.id}
                    onChange={(e) => onUpdateUser(u.id, "role", e.target.value)}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                    }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <select
                    value={u.status}
                    disabled={savingId === u.id}
                    onChange={(e) => onUpdateUser(u.id, "status", e.target.value)}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <button 
                    onClick={() => onDelete(u.id)} 
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #dc3545",
                      background: "#fff",
                      color: "#dc3545",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Xoá
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
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

function CreateUserModal({ onClose, onCreate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("INTERN");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onCreate({ fullName, email, role });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        width: 400,
        maxWidth: "90vw",
      }}>
        <h2 style={{ margin: "0 0 16px 0" }}>Thêm người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
              Họ tên
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
              Vai trò
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                border: "none",
                background: "#007bff",
                color: "white",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Th = ({ children, style }) => <th style={{ padding: 12, ...style }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: 12 }}>{children}</td>;
