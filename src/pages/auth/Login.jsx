import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// Mock users for testing
const mockUsers = [
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

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock authentication
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Simulate JWT token
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f7f7",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          width: 360,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Đăng nhập</h1>

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

        <div
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: "#666",
            padding: "8px 12px",
            background: "#e7f3ff",
            borderRadius: 4,
          }}
        >
          <strong>Tài khoản test:</strong>
          <br />
          Admin: admin@company.com / admin123
          <br />
          HR: hr@company.com / hr123
          <br />
          Mentor: mentor@company.com / mentor123
          <br />
          Intern: intern@company.com / intern123
        </div>

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
            marginBottom: 16,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: 0,
            borderRadius: 10,
            background: loading ? "#ccc" : "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
