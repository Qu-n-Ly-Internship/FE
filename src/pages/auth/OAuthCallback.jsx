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
      const urlToken = params.get("token") || params.get("access_token") || params.get("jwt");
      const redirect = params.get("redirect") || "/";

      try {
        let user = null;
        let token = urlToken || null;

        // If backend gave us a token in URL, try to fetch profile with it
        if (token) {
          // Temporarily set token just to fetch profile
          setAuth(null, token);
        }

        // Try to fetch current user using cookie session or provided token
        const { data } = await api.get("/auth/me");
        user = data?.user || data || null;

        // If no token (cookie-based session), mark token as 'session' so ProtectedRoute passes
        if (!token) {
          token = "session";
        }

        if (!user) {
          throw new Error("Không lấy được thông tin user sau khi đăng nhập");
        }

        setAuth(user, token);
        navigate(redirect, { replace: true });
      } catch (e) {
        console.error(e);
        setError("Đăng nhập không thành công. Vui lòng thử lại.");
      }
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-container" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="auth-right">
        {error ? (
          <div>
            <div style={{ color: "#dc3545", marginBottom: 12 }}>{error}</div>
            <button className="btn btn-primary" onClick={() => (window.location.href = "/login")}>Quay lại Login</button>
          </div>
        ) : (
          <div>Đang xử lý đăng nhập...</div>
        )}
      </div>
    </div>
  );
}
