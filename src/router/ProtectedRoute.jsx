import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
  const { user, token } = useAuthStore();

  // Nếu chưa có token => bắt login lại
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token nhưng chưa load user (VD: refresh page), 
  // thì cho phép đi tiếp, vì AppLayout hoặc useEffect có thể gọi /auth/me để load user
  if (!user) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return <Outlet />;
}
