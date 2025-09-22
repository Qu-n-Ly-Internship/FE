import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Index";
import InternshipList from "../pages/internships/InternshipList";
import StudentList from "../pages/students/StudentList";
import CompanyList from "../pages/companies/CompanyList";
import Users from "../pages/admin/Users";
import Permissions from "../pages/admin/Permissions";

// Layout & Guards
import AppLayout from "../components/layout/Layout"; // 👈 đổi tên import
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RoleGuard from "../components/layout/RoleGuard";
//
import DocQueue from "../pages/hr/DocQueue";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {" "}
            {/* 👈 dùng AppLayout */}
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/internships"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <InternshipList />
                </RoleGuard>
              }
            />
            <Route
              path="/students"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <StudentList />
                </RoleGuard>
              }
            />
            <Route
              path="/companies"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <CompanyList />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <Users />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <Permissions />
                </RoleGuard>
              }
            />
            {/* trong block <Route element={<ProtectedRoute />}><Route element={<AppLayout />} */}
            <Route
              path="/hr/documents"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <DocQueue />
                </RoleGuard>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
