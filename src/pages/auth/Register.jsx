import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";

let mockUsers = [
  { id: 1, email: "admin@company.com", password: "admin123", fullName: "Admin User", role: "ADMIN" },
  { id: 2, email: "hr@company.com", password: "hr123", fullName: "HR Manager", role: "HR" },
  { id: 3, email: "mentor@company.com", password: "mentor123", fullName: "Mentor", role: "MENTOR" },
  { id: 4, email: "intern@company.com", password: "intern123", fullName: "Intern", role: "INTERN" },
];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

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

    const token = `mock-jwt-token-${newUser.id}`;
    setAuth(newUser, token);
    navigate("/"); // auto login rồi chuyển về home
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
      {/* Bên trái */}
      <div style={{ flex: 1, background: "#e0e0e0" }}>
        <img src={teamworkImage} alt="Teamwork" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Form bên phải */}
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
          <img src={logoTeam} alt="Logo Register" style={{ width: "200px", height: "200px" }} />
        </div>

        <h1 style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>Đăng ký</h1>

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
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </span>
        </div>
      </div>
    </div>
  );
}
