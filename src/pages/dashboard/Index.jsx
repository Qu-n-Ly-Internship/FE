import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    console.log('Dashboard - Current user:', user);
    // Chỉ USER mới bị chuyển hướng, INTERN có thể xem Dashboard
    if (user?.role === "USER") {
      console.log('Redirecting USER to upload-documents');
      navigate("/upload-documents", { replace: true });
    }
  }, [user, navigate]);

  // Chỉ USER mới không được xem Dashboard
  if (user?.role === "USER") {
    return (
      <div className="dashboard-container">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-desc">
        Chào mừng {user?.fullName} ({user?.role})
      </p>
      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
        <strong>Debug info:</strong> User role = {user?.role || 'undefined'}
      </div>
      {user?.role === "ADMIN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý hệ thống</h3>
          <p>Bạn có thể quản lý người dùng, phân quyền và xem báo cáo.</p>
        </div>
      )}
      {user?.role === "HR" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý nhân sự</h3>
          <p>Bạn có thể quản lý thực tập sinh, duyệt hồ sơ và theo dõi tiến độ.</p>
        </div>
      )}
      {user?.role === "INTERN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Thực tập sinh</h3>
          <p>Chào mừng bạn đến với chương trình thực tập! Bạn có thể xem profile và theo dõi tiến độ thực tập của mình.</p>
        </div>
      )}
    </div>
  );
}
