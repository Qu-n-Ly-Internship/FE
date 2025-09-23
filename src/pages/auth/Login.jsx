import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Xử lý login ---
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

  // 👉 Mock đăng nhập Google
  function loginWithGoogle() {
    const user = {
      id: 100,
      email: "googleuser@gmail.com",
      fullName: "Google User",
      role: "USER",
    };
    const token = "mock-google-token";
    setAuth(user, token);
    navigate("/");
  }

  // 👉 Mock đăng nhập GitHub
  function loginWithGitHub() {
    const user = {
      id: 101,
      email: "githubuser@github.com",
      fullName: "GitHub User",
      role: "USER",
    };
    const token = "mock-github-token";
    setAuth(user, token);
    navigate("/");
  }

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

        <button onClick={loginWithGoogle} className="btn btn-outline">
          🔴 Đăng nhập với Google
        </button>

        {/* Link sang đăng ký */}
        <div className="auth-footer">
          Chưa có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
}
