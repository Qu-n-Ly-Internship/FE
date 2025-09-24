import api from "./apiClient";

const MOCK = true; // bật mock

// Định nghĩa các quyền có thể có trong hệ thống
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  
  // Internships
  VIEW_INTERNSHIPS: "VIEW_INTERNSHIPS",
  CREATE_INTERNSHIP: "CREATE_INTERNSHIP",
  EDIT_INTERNSHIP: "EDIT_INTERNSHIP",
  DELETE_INTERNSHIP: "DELETE_INTERNSHIP",
  
  // Students
  VIEW_STUDENTS: "VIEW_STUDENTS",
  CREATE_STUDENT: "CREATE_STUDENT",
  EDIT_STUDENT: "EDIT_STUDENT",
  DELETE_STUDENT: "DELETE_STUDENT",
  
  // Admin
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",
  VIEW_REPORTS: "VIEW_REPORTS",
};

// Nhóm quyền theo module
export const PERMISSION_GROUPS = {
  "Dashboard": [PERMISSIONS.VIEW_DASHBOARD],
  "Quản lý Thực tập": [
    PERMISSIONS.VIEW_INTERNSHIPS,
    PERMISSIONS.CREATE_INTERNSHIP,
    PERMISSIONS.EDIT_INTERNSHIP,
    PERMISSIONS.DELETE_INTERNSHIP,
  ],
  "Quản lý Sinh viên": [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
  ],
  "Quản trị": [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

// Mock data - quyền mặc định cho từng role
const mockRolePermissions = {
  ADMIN: Object.values(PERMISSIONS), // Admin có tất cả quyền
  HR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INTERNSHIPS,
    PERMISSIONS.CREATE_INTERNSHIP,
    PERMISSIONS.EDIT_INTERNSHIP,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
  ],
  MENTOR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INTERNSHIPS,
    PERMISSIONS.VIEW_STUDENTS,
  ],
  INTERN: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],
};

// Lấy danh sách quyền của một role
export async function getRolePermissions(role) {
  if (MOCK) {
    return { permissions: mockRolePermissions[role] || [] };
  }
  const { data } = await api.get(`/admin/roles/${role}/permissions`);
  return data;
}

// Cập nhật quyền cho một role
export async function updateRolePermissions(role, permissions) {
  if (MOCK) {
    mockRolePermissions[role] = permissions;
    return { success: true };
  }
  const { data } = await api.put(`/admin/roles/${role}/permissions`, { permissions });
  return data;
}

// Lấy tất cả roles và quyền của chúng
export async function getAllRolePermissions() {
  if (MOCK) {
    return {
      roles: Object.keys(mockRolePermissions).map(role => ({
        role,
        permissions: mockRolePermissions[role],
      }))
    };
  }
  const { data } = await api.get("/admin/roles/permissions");
  return data;
}
