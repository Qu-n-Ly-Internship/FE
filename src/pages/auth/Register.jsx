import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./auth.css";

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
  const [fieldErrors, setFieldErrors] = useState({});

  function validate(values) {
    const errs = {};
    const name = values.fullName.trim();
    const mail = values.email.trim();
    const pass = values.password;
    const cpass = values.confirmPassword;

    if (!name) errs.fullName = "Vui lòng nhập họ và tên";
    if (!mail) {
      errs.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mail)) errs.email = "Email không hợp lệ";
    }
    if (!pass) {
      errs.password = "Vui lòng nhập mật khẩu";
    } else if (pass.length < 6) {
      errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!cpass) {
      errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (pass !== cpass) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return errs;
  }

  function onRegister(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const values = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    };

    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const existUser = mockUsers.find((u) => u.email.toLowerCase() === values.email);
    if (existUser) {
      setError("Email đã tồn tại");
      return;
    }

    const newUser = {
      id: mockUsers.length + 1,
      email: values.email,
      password: values.password,
      fullName: values.fullName || "New User",
      role: "USER",
    };

    mockUsers.push(newUser);

    const token = `mock-jwt-token-${newUser.id}`;
    setAuth(newUser, token);
    navigate("/"); // auto login rồi chuyển về home
  }

  return (
    <div className="auth-container">
      {/* Bên trái */}
      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      {/* Form bên phải */}
      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo Register" />
        </div>

        <h1 className="auth-title">Đăng ký</h1>

        {error && <div className="auth-alert">{error}</div>}

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Họ và tên"
          className="auth-input"
        />
        {fieldErrors.fullName && (
          <div className="auth-inline-error">{fieldErrors.fullName}</div>
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="auth-input"
        />
        {fieldErrors.email && (
          <div className="auth-inline-error">{fieldErrors.email}</div>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="auth-input"
        />
        {fieldErrors.password && (
          <div className="auth-inline-error">{fieldErrors.password}</div>
        )}
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Xác nhận mật khẩu"
          className="auth-input"
        />
        {fieldErrors.confirmPassword && (
          <div className="auth-inline-error">{fieldErrors.confirmPassword}</div>
        )}

        <button
          onClick={onRegister}
          disabled={!fullName || !email || !password || !confirmPassword}
          className="btn btn-success"
        >
          Đăng ký
        </button>

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
