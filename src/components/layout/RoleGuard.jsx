import { useAuthStore } from "../../store/authStore";

export default function RoleGuard({ roles = [], children }) {
  const user = useAuthStore((s) => s.user);
  console.log('RoleGuard - User:', user, 'Required roles:', roles);
  
  if (!user) {
    console.log('RoleGuard - No user found');
    return null;
  }
  
  if (roles.length && !roles.includes(user.role)) {
    console.log('RoleGuard - Access denied. User role:', user.role, 'Required:', roles);
    return <div style={{ padding: 24 }}>Bạn không có quyền truy cập.</div>;
  }
  
  console.log('RoleGuard - Access granted');
  return children;
}
