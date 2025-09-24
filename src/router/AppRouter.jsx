import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Index";
import InternshipList from "../pages/internships/InternshipList";
import StudentList from "../pages/students/StudentList";
import Users from "../pages/admin/Users";
import Permissions from "../pages/admin/Permissions";
import OAuthCallback from "../pages/auth/OAuthCallback";
import DocQueue from "../pages/hr/DocQueue";

import AppLayout from "../components/layout/Layout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/internships" element={<InternshipList />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/permissions" element={<Permissions />} />
            <Route path="/hr/documents" element={<DocQueue />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
