import api from "./apiClient";

// LIST
export async function getUsers(params) {
  try {
    const response = await api.get("/admin/users", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
}

// CREATE
export async function createUser({
  fullName,
  email,
  role,
  status = "PENDING",
  password,
}) {
  const { data } = await api.post("/admin/users", {
    fullName,
    email,
    role,
    status,
    password,
  });
  return data;
}

// UPDATE
export async function updateUser({ id, fullName, role, status }) {
  const { data } = await api.put(`/admin/users/${id}`, {
    fullName,
    role,
    status,
  });
  return data;
}

// DELETE
export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}
