import { useAuthStore } from "../../store/authStore";

export default function RoleGuard({ roles = [], children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (roles.length && !roles.includes(user.role)) {
    return <div style={{ padding: 24 }}>Bạn không có quyền truy cập.</div>;
  }
  return children;
}
