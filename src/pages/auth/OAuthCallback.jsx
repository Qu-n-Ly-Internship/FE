import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/apiClient";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      setError("");
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (!token) {
        setError("Không tìm thấy token từ backend");
        return;
      }

      try {
        localStorage.setItem("token", token);

        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuth(data, token);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setError("Đăng nhập thất bại.");
      }
    }

    handleCallback();
  }, [location, navigate, setAuth]);

  return (
    <div className="auth-container">
      {error ? <div>{error}</div> : <div>Đang xử lý đăng nhập...</div>}
    </div>
  );
}
