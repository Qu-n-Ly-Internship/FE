import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function RoleGuard({ roles, children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Đang tải...</div>;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
