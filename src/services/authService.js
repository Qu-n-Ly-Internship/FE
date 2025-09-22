import api from "./apiClient";

// Spring Boot: POST /api/auth/login  -> body { email, password }
// response: { token, user: { id, email, fullName, role } }
export async function loginApi(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

