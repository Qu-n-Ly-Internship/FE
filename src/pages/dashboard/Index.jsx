import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useAuthStore } from "../../store/authStore";
import { getUsers, getUserRoleStats } from "../../services/adminService";
import {
  getInternships,
  getInternStatusStats,
} from "../../services/internshipService";
import { getContractTotal } from "../../services/documentService";
import "./dashboard.css";

const ROLE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#f620aeff"];
const INTERN_COLORS = ["#00C49F", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [userCount, setUserCount] = useState(null);
  const [profileCount, setProfileCount] = useState(null);
  const [contractCount, setContractCount] = useState(null);
  const [roleStats, setRoleStats] = useState([]);
  const [internStats, setInternStats] = useState([]);

  // Redirect USER role to upload-documents
  useEffect(() => {
    if (user?.role === "USER") {
      navigate("/upload-documents", { replace: true });
    }
  }, [user, navigate]);

  // Fetch user count
  useEffect(() => {
    let mounted = true;
    async function fetchUserCount() {
      try {
        const data = await getUsers({ q: "", role: "", status: "" });
        if (mounted) setUserCount(data.totalUsers ?? data.total ?? 0);
      } catch (err) {
        console.error("Failed to load user count", err);
        if (mounted) setUserCount(0);
      }
    }
    fetchUserCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch intern profile count
  useEffect(() => {
    let mounted = true;
    async function fetchProfileCount() {
      try {
        const data = await getInternships({ page: 0, size: 1 });
        const total = data.pagination?.totalElements ?? 0;
        if (mounted) setProfileCount(total);
      } catch (err) {
        console.error("Failed to load intern profile count", err);
        if (mounted) setProfileCount(0);
      }
    }
    fetchProfileCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch contract count
  useEffect(() => {
    let mounted = true;
    async function fetchContractCount() {
      try {
        const total = await getContractTotal();
        if (mounted) setContractCount(total);
      } catch (err) {
        console.error("Failed to load contract count", err);
        if (mounted) setContractCount(0);
      }
    }
    fetchContractCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user role stats
  useEffect(() => {
    let mounted = true;
    async function fetchRoleStats() {
      try {
        const data = await getUserRoleStats();
        if (mounted) setRoleStats(data);
      } catch (err) {
        console.error("Failed to load user role stats", err);
      }
    }
    fetchRoleStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch intern status stats
  useEffect(() => {
    let mounted = true;
    async function fetchInternStats() {
      try {
        const data = await getInternStatusStats();
        if (mounted) setInternStats(data);
      } catch (err) {
        console.error("Failed to load intern status stats", err);
      }
    }
    fetchInternStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Redirect USER role
  if (user?.role === "USER") {
    return (
      <div className="dashboard-container center">
        <div className="loading center">Đang chuyển hướng...</div>
      </div>
    );
  }

  // Stats data
  const stats = [
    {
      label: "Hợp đồng",
      value: contractCount ?? "...",
      icon: "📑",
      color: "#eafbe7",
    },
    {
      label: "Thực tập sinh",
      value: profileCount ?? "...",
      icon: "📄",
      color: "#ffeaea",
    },
    {
      label: "Người dùng",
      value: userCount ?? "...",
      icon: "👥",
      color: "#eaf3ff",
    },
  ];

  // Tips data
  const tips = [
    {
      icon: "💡",
      text: "Bạn có thể cập nhật thông tin cá nhân tại trang hồ sơ.",
    },
    {
      icon: "📅",
      text: "Kiểm tra lịch thực tập và các sự kiện sắp tới.",
    },
    {
      icon: "🔔",
      text: "Luôn theo dõi thông báo mới từ hệ thống.",
    },
    {
      icon: "🛡️",
      text: "Bảo mật tài khoản bằng cách đổi mật khẩu định kỳ.",
    },
  ];

  // Role-specific content
  const getRoleContent = () => {
    switch (user?.role) {
      case "ADMIN":
        return {
          title: "Quản lý hệ thống",
          description:
            "Bạn có thể quản lý người dùng, phân quyền và xem báo cáo.",
        };
      case "HR":
        return {
          title: "Quản lý nhân sự",
          description:
            "Bạn có thể quản lý thực tập sinh, duyệt hồ sơ và theo dõi tiến độ.",
        };
      case "INTERN":
        return {
          title: "Thực tập sinh",
          description:
            "Chào mừng bạn đến với chương trình thực tập! Bạn có thể xem profile và theo dõi tiến độ thực tập của mình.",
        };
      default:
        return null;
    }
  };

  const roleContent = getRoleContent();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-desc">
        Chào mừng <strong>{user?.fullName}</strong> ({user?.role})
      </p>

      {/* Stats Cards */}
      <div className="dashboard-stats-row">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="dashboard-stat-card"
            style={{ background: stat.color }}
          >
            <span className="dashboard-stat-icon">{stat.icon}</span>
            <div className="dashboard-stat-info">
              <div className="dashboard-stat-value">{stat.value}</div>
              <div className="dashboard-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Mẹo sử dụng hệ thống</h2>
        <ul className="dashboard-tips-list">
          {tips.map((tip, idx) => (
            <li key={idx} className="dashboard-tip-item">
              <span className="dashboard-tip-icon">{tip.icon}</span>
              <span className="dashboard-tip-text">{tip.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Charts Row */}
      <div className="chart-row">
        {/* User Role Stats Chart */}
        <div className="chart-box">
          <h2 className="chart-title">Thống kê người dùng theo vai trò</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={roleStats}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {roleStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Intern Status Stats Chart */}
        <div className="chart-box">
          <h2 className="chart-title">Thống kê trạng thái thực tập sinh</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={internStats}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {internStats.map((entry, index) => (
                <Cell
                  key={`cell-intern-${index}`}
                  fill={INTERN_COLORS[index % INTERN_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Role-specific Info */}
      {roleContent && (
        <div className="dashboard-role-info">
          <h3>{roleContent.title}</h3>
          <p>{roleContent.description}</p>
        </div>
      )}
    </div>
  );
}
