import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/apiClient";


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
  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email && u.password === password);

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

  // --- Xử lý register ---
  function onRegister(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    const existUser = mockUsers.find((u) => u.email === email);
    if (existUser) {
      setError("Email đã tồn tại");
      return;
    }

    const newUser = {
      id: mockUsers.length + 1,
      email,
      password,
      fullName: fullName || "New User",
      role: "USER",
    };

    mockUsers.push(newUser);

    // auto login sau khi đăng ký
    const token = `mock-jwt-token-${newUser.id}`;
    setAuth(newUser, token);
    navigate("/");
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
      {/* Logo + khu vực bên trái */}
      <div style={{ flex: 1, background: "#e0e0e0" }}>
        <img
          src={teamworkImage}
          alt="Teamwork"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Khu vực form bên phải */}
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "40px 24px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: "40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={logoTeam}
            alt="Logo Login"
            style={{ width: "200px", height: "200px" }}
          />
        </div>

        <h1 style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
          Đăng nhập
        </h1>

        {error && (
          <div
            style={{
              color: "#dc3545",
              fontSize: 14,
              marginBottom: 12,
              padding: "8px 12px",
              background: "#f8d7da",
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}

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
          <a
            href="/forgot-password"
            style={{ fontSize: 12, color: "#007bff", textDecoration: "none" }}
          >
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
            onClick={() => navigate("/register")} // 👈 chuyển sang trang đăng ký
          >
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
}
