// src/pages/internships/AllowanceHistory.jsx - Chuẩn hóa
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyAllowanceHistory } from "../../services/allowanceService";
import { useAuthStore } from "../../store/authStore";
import "../hr/AllowanceManagement.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
}

export default function AllowanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      if (!currentUser) {
        toast.error("Vui lòng đăng nhập để xem lịch sử phụ cấp");
        setLoading(false);
        return;
      }

      if (!currentUser.email) {
        toast.error(
          "Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại"
        );
        setLoading(false);
        return;
      }

      console.log("Fetching allowance history for email:", currentUser.email);

      const response = await getMyAllowanceHistory(currentUser.email);

      console.log("Response from backend:", response);

      if (response.success && response.data) {
        setHistory(response.data);
        toast.success("Tải dữ liệu thành công!");
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(
        err.response?.data?.message || "Không thể tải lịch sử phụ cấp"
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: history.length,
    paid: history.filter((h) => h.paidAt).length,
    unpaid: history.filter((h) => !h.paidAt).length,
    totalAmount: history.reduce((sum, h) => sum + (h.amount || 0), 0),
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">💰 Lịch sử Phụ cấp của tôi</h1>
        <button className="btn btn-primary" onClick={fetchHistory}>
          🔄 Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">💰</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng phụ cấp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">{stats.paid}</div>
            <div className="stat-label">Đã thanh toán</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">{stats.unpaid}</div>
            <div className="stat-label">Chưa thanh toán</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-total">💵</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: "20px" }}>
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="stat-label">Tổng số tiền</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading center">Đang tải...</div>
        ) : history.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-text">Bạn chưa có phụ cấp nào được duyệt</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">STT</th>
                  <th className="table-th">Ngày áp dụng</th>
                  <th className="table-th">Loại phụ cấp</th>
                  <th className="table-th">Số tiền</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ngày thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.allowanceId}>
                    <td className="table-td center">{index + 1}</td>
                    <td className="table-td">{formatDate(item.applyDate)}</td>
                    <td className="table-td">{item.allowanceType || "N/A"}</td>
                    <td className="table-td">
                      <strong style={{ color: "var(--success)" }}>
                        {formatCurrency(item.amount)}
                      </strong>
                    </td>
                    <td className="table-td center">
                      {item.paidAt ? (
                        <span className="badge badge-approved">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="table-td center">
                      {item.paidAt ? formatDate(item.paidAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
