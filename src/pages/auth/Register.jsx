import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../../store/authStore";
import { register } from "../../services/authService";
import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation functions
  const validateFullName = (value) => {
    if (!value.trim()) return "Vui lòng nhập họ và tên";
    return "";
  };

  const validateEmail = (value) => {
    const mail = value.trim();
    if (!mail) return "Vui lòng nhập email";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) return "Email không hợp lệ";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Vui lòng nhập mật khẩu";
    if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value) return "Vui lòng xác nhận mật khẩu";
    if (password !== value) return "Mật khẩu xác nhận không khớp";
    return "";
  };

  // Handle change functions
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));

    // Re-validate confirmPassword if it exists
    if (confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== confirmPassword ? "Mật khẩu xác nhận không khớp" : "",
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(value),
    }));
  };

  async function onRegister(e) {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Check if any errors
    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "USER",
      });

      if (!response.success) {
        toast.error(response.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      const token = response.token || "session";
      setAuth(response.user, token);

      toast.success("Đăng ký thành công!");

      // Navigate based on role
      setTimeout(() => {
        if (response.user.role === "USER") {
          navigate("/upload-documents");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error("Register error:", err);
      toast.error(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    fullName &&
    email &&
    password &&
    confirmPassword &&
    !errors.fullName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  return (
    <div className="auth-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo" />
        </div>

        <h1 className="auth-title">Đăng ký</h1>

        <form onSubmit={onRegister}>
          <input
            value={fullName}
            onChange={handleFullNameChange}
            placeholder="Họ và tên"
            className="auth-input"
            disabled={loading}
            type="text"
          />
          {errors.fullName && (
            <div className="auth-inline-error">{errors.fullName}</div>
          )}

          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Email"
            className="auth-input"
            disabled={loading}
          />
          {errors.email && (
            <div className="auth-inline-error">{errors.email}</div>
          )}

          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            className="auth-input"
            disabled={loading}
          />
          {errors.password && (
            <div className="auth-inline-error">{errors.password}</div>
          )}

          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Xác nhận mật khẩu"
            className="auth-input"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <div className="auth-inline-error">{errors.confirmPassword}</div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="btn btn-success"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/login")}>
            Đăng nhập
          </span>
        </div>
      </div>
    </div>
  );
}
