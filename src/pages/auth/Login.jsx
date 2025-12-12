import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuthStore } from "../../store/authStore";
import { login } from "../../services/authService";
import Chatbot from "../../components/chatbot/Chatbot";
import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });

      if (!response.success) {
        setError(response.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      setAuth(response.user, response.token);

      // Lưu userId và user object
      const userId = response.userId || response.id || response.user_id;
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      const userObject = {
        userId: userId,
        email: response.email,
        fullname: response.fullname || response.name,
        role: response.role,
      };
      localStorage.setItem("user", JSON.stringify(userObject));

      // Navigate based on role
      if (response.user.role === "USER") {
        navigate("/upload-documents");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    // window.location.href = "http://codeft.duckdns.org:8090/oauth2/authorization/google";
    window.location.href = "http://localhost:8090/oauth2/authorization/google";
  }

  if (!hasHydrated) {
    return (
      <div
        className="auth-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="loading center">Đang tải...</div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo" />
        </div>

        <h1 className="auth-title">Đăng nhập</h1>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={onLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            className="auth-input"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            disabled={loading}
            className="auth-input"
            required
          />

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          className="btn btn-outline"
          disabled={loading}
        >
          <FcGoogle />
          <span>Đăng nhập với Google</span>
        </button>

        <div className="auth-footer">
          Chưa có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </span>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}
