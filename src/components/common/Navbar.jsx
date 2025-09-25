import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./navbar.css";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Hamburger Menu Button */}
        <button
          type="button"
          aria-label="Mở menu"
          onClick={onMenuClick}
          className="navbar-hamburger"
        >
          <span className="navbar-hamburger-bar" />
          <span className="navbar-hamburger-bar" />
          <span className="navbar-hamburger-bar" />
        </button>

        <h1 className="navbar-title">Quản lý Thực tập</h1>
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {user?.fullName} ({user?.role})
        </span>
        <button type="button" onClick={handleLogout} className="navbar-logout">
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
