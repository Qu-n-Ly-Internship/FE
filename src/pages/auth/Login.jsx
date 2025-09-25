// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./auth.css";

// 👉 Import ảnh
import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";

// Mock users for testing
let mockUsers = [
  {
    id: 1,
    email: "admin@company.com",
    password: "admin123",
    fullName: "Admin User",
    role: "ADMIN",
  },
  {
    id: 2,
    email: "hr@company.com",
    password: "hr123",
    fullName: "HR Manager",
    role: "HR",
  },
  {
    id: 3,
    email: "mentor@company.com",
    password: "mentor123",
    fullName: "Mentor",
    role: "MENTOR",
  },
  {
    id: 4,
    email: "intern@company.com",
    password: "intern123",
    fullName: "Intern",
    role: "INTERN",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Xử lý login mock ---
  function onLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        const mockToken = `mock-jwt-token-${user.id}`;
        setAuth(
          {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          mockToken
        );
        navigate("/");
      } else {
        setError("Email hoặc mật khẩu không đúng");
      }
      setLoading(false);
    }, 1000);
  }

  // 👉 Đăng nhập Google (redirect thật tới backend Spring Security)
  function loginWithGoogle() {
    window.location.href = "http://localhost:8090/oauth2/authorization/google";
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Wait for persisted auth to hydrate to avoid flicker/error on F5
  if (!hasHydrated) {
    return (
      <div
        className="auth-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="auth-right">Đang tải...</div>
      </div>
    );
  }

  // Nếu đã login thì chuyển hướng về trang chủ
  if (token) {
    return <Navigate to="/" replace />;
  }

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  return (
    <div className="auth-container">
      {/* Logo + khu vực bên trái */}
      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      {/* Khu vực form bên phải */}
      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo Login" />
        </div>

        <h1 className="auth-title">Đăng nhập</h1>

        {error && <div className="auth-alert">{error}</div>}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading}
          className="auth-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          disabled={loading}
          className="auth-input"
        />

        <div className="auth-link-row">
          <a href="/forgot-password" className="auth-link">
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          onClick={onLogin}
          className="btn btn-primary"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* Nút login Google */}
        <button
          onClick={loginWithGoogle}
          className="btn btn-outline google-btn"
        >
          <svg
            className="google-icon"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="google-g-clip">
                <circle cx="24" cy="24" r="20" />
              </clipPath>
            </defs>
            <g clipPath="url(#google-g-clip)">
              <path
                fill="#4285F4"
                d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.6l6.1-6.1C34.5 5.1 29.5 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.1-2.5z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.7 0 5.2.9 7.2 2.6l6.1-6.1C34.5 5.1 29.5 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"
              />
              <path
                fill="#FBBC05"
                d="M24 43c5.3 0 10.3-1.8 14.1-4.9l-6.5-5.3c-2 1.4-4.5 2.2-7.6 2.2-5.6 0-10.3-3.7-12-8.7l-6.6 5.1C7.9 39.2 15.3 43 24 43z"
              />
              <path
                fill="#EA4335"
                d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.4-6.5 6.7l6.5 5.3c-2.9 2.1-6.6 3.4-10.8 3.4-8.7 0-16.1-3.8-19.7-9.7l6.6-5.1c1.7 5 6.4 8.7 12 8.7 3.1 0 5.6-.8 7.6-2.2l6.5 5.3C34.3 41.2 29.3 43 24 43z"
              />
            </g>
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

<<<<<<< Updated upstream
        {/* Link sang đăng ký */}
        <div className="auth-footer">
          Chưa có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </span>
        </div>
=======
        {/* Nếu là login */}
        {!isRegister && (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />

            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <a href="/forgot-password" style={{ fontSize: 12, color: "#007bff", textDecoration: "none" }}>
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={onLogin}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: 0,
                borderRadius: 10,
                background: loading ? "#ccc" : "#111",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 12,
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <button
              onClick={loginWithGoogle}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              🔴 Đăng nhập với Google
            </button>

            {/* Link sang đăng ký */}
            <div style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
              Chưa có tài khoản?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={() => setIsRegister(true)}
              >
                Đăng ký ngay
              </span>
            </div>
          </>
        )}

        {/* Nếu là register */}
        {isRegister && (
          <>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Họ và tên"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 16,
              }}
            />

            <button
              onClick={onRegister}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: 0,
                borderRadius: 10,
                background: "#28a745",
                color: "#fff",
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              Đăng ký
            </button>

            <div style={{ fontSize: 14, textAlign: "center" }}>
              Đã có tài khoản?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={() => setIsRegister(false)}
              >
                Đăng nhập
              </span>
            </div>
          </>
        )}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
