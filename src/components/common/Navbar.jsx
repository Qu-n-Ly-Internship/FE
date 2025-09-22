import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e5e5",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            width: "24px",
            height: "24px",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          <div style={{
            width: "18px",
            height: "2px",
            backgroundColor: "#333",
            borderRadius: "1px",
          }} />
          <div style={{
            width: "18px",
            height: "2px",
            backgroundColor: "#333",
            borderRadius: "1px",
          }} />
          <div style={{
            width: "18px",
            height: "2px",
            backgroundColor: "#333",
            borderRadius: "1px",
          }} />
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Quản lý Thực tập
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {user?.fullName} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
