import { useEffect, useState } from "react";
import { getAllRolePermissions, updateRolePermissions, PERMISSION_GROUPS } from "../../services/permissionService";

export default function Permissions() {
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    setError("");
    try {
      const { roles } = await getAllRolePermissions();
      const permissionsMap = {};
      roles.forEach(({ role, permissions }) => {
        permissionsMap[role] = permissions;
      });
      setRolePermissions(permissionsMap);
    } catch (e) {
      setError("Không thể tải danh sách quyền");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (role, permission, checked) => {
    setSaving(`${role}-${permission}`);
    setError("");
    setSuccess("");

    try {
      const currentPermissions = rolePermissions[role] || [];
      let newPermissions;
      
      if (checked) {
        newPermissions = [...currentPermissions, permission];
      } else {
        newPermissions = currentPermissions.filter(p => p !== permission);
      }

      await updateRolePermissions(role, newPermissions);
      
      setRolePermissions(prev => ({
        ...prev,
        [role]: newPermissions
      }));
      
      setSuccess(`Đã cập nhật quyền cho ${role}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Cập nhật quyền thất bại");
    } finally {
      setSaving(null);
    }
  };

  const isPermissionChecked = (role, permission) => {
    return rolePermissions[role]?.includes(permission) || false;
  };

  const isPermissionSaving = (role, permission) => {
    return saving === `${role}-${permission}`;
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  const roles = Object.keys(rolePermissions);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Quản lý Phân quyền
      </h1>
      
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
        Tích vào ô để cấp quyền cho vai trò tương ứng. Thay đổi sẽ được lưu tự động.
      </p>

      {error && (
        <div style={{
          color: "#dc3545",
          background: "#f8d7da",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: "#155724",
          background: "#d4edda",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #c3e6cb"
        }}>
          {success}
        </div>
      )}

      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{
                padding: "16px",
                textAlign: "left",
                fontWeight: 600,
                borderBottom: "2px solid #dee2e6",
                minWidth: "200px"
              }}>
                Quyền
              </th>
              {roles.map(role => (
                <th key={role} style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: 600,
                  borderBottom: "2px solid #dee2e6",
                  minWidth: "120px"
                }}>
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
              <>
                <tr key={`group-${groupName}`}>
                  <td colSpan={roles.length + 1} style={{
                    padding: "12px 16px",
                    background: "#e9ecef",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#495057"
                  }}>
                    {groupName}
                  </td>
                </tr>
                {permissions.map(permission => (
                  <tr key={permission} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      {getPermissionLabel(permission)}
                    </td>
                    {roles.map(role => (
                      <td key={`${role}-${permission}`} style={{
                        padding: "12px 16px",
                        textAlign: "center"
                      }}>
                        <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={isPermissionChecked(role, permission)}
                            disabled={isPermissionSaving(role, permission)}
                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                            style={{
                              width: 18,
                              height: 18,
                              cursor: isPermissionSaving(role, permission) ? "not-allowed" : "pointer"
                            }}
                          />
                          {isPermissionSaving(role, permission) && (
                            <span style={{
                              marginLeft: 8,
                              fontSize: 12,
                              color: "#666"
                            }}>
                              ...
                            </span>
                          )}
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function để hiển thị tên quyền dễ hiểu
function getPermissionLabel(permission) {
  const labels = {
    VIEW_DASHBOARD: "Xem Dashboard",
    VIEW_INTERNSHIPS: "Xem danh sách thực tập",
    CREATE_INTERNSHIP: "Tạo thực tập mới",
    EDIT_INTERNSHIP: "Chỉnh sửa thực tập",
    DELETE_INTERNSHIP: "Xóa thực tập",
    VIEW_STUDENTS: "Xem danh sách sinh viên",
    CREATE_STUDENT: "Thêm sinh viên mới",
    EDIT_STUDENT: "Chỉnh sửa sinh viên",
    DELETE_STUDENT: "Xóa sinh viên",
    VIEW_COMPANIES: "Xem danh sách công ty",
    CREATE_COMPANY: "Thêm công ty mới",
    EDIT_COMPANY: "Chỉnh sửa công ty",
    DELETE_COMPANY: "Xóa công ty",
    MANAGE_USERS: "Quản lý người dùng",
    MANAGE_PERMISSIONS: "Quản lý phân quyền",
    VIEW_REPORTS: "Xem báo cáo",
  };
  return labels[permission] || permission;
}
