import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AllowanceManagement.css";

import InternSelectionModal from "../../components/common/InternSelectionModal";
import {
  createAllowance,
  getAllowances,
  deleteAllowance,
} from "../../services/allowanceService";

function formatDate(dateString) {
  if (!dateString) return "";
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
  }).format(amount);
}

export default function AllowanceManagement() {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAllowances();
  }, []);

  const loadAllowances = async () => {
    try {
      setLoading(true);
      const data = await getAllowances();
      console.log("Loaded allowances:", data);
      setAllowances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load allowances:", error);
      toast.error("Không thể tải danh sách phụ cấp!");
      setAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllowance = async (newAllowance) => {
    try {
      const response = await createAllowance(newAllowance);
      console.log("Create response:", response);

      if (response.success) {
        toast.success(response.message || "Thêm phụ cấp thành công! 🎉");
        await loadAllowances();
        setShowCreateModal(false);
      } else {
        toast.error(response.message || "Thêm phụ cấp thất bại!");
      }
    } catch (error) {
      console.error("Failed to create allowance:", error);
      const errorMessage =
        error.response?.data?.message || "Thêm phụ cấp thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAllowance = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phụ cấp này?")) {
      return;
    }

    try {
      const response = await deleteAllowance(id);
      if (response.success) {
        toast.success("Xóa phụ cấp thành công!");
        await loadAllowances();
      }
    } catch (error) {
      console.error("Failed to delete allowance:", error);
      toast.error(error.response?.data?.message || "Xóa phụ cấp thất bại!");
    }
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý Phụ cấp</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Thêm phụ cấp mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">💰</div>
          <div className="stat-info">
            <div className="stat-value">{allowances.length}</div>
            <div className="stat-label">Tổng phụ cấp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {allowances.filter((a) => a.paidAt).length}
            </div>
            <div className="stat-label">Đã thanh toán</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {allowances.filter((a) => !a.paidAt).length}
            </div>
            <div className="stat-label">Chưa thanh toán</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-total">💵</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: "20px" }}>
              {formatCurrency(
                allowances.reduce((sum, a) => sum + (a.amount || 0), 0)
              )}
            </div>
            <div className="stat-label">Tổng số tiền</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading center">Đang tải...</div>
        ) : allowances.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-text">Chưa có dữ liệu phụ cấp</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">STT</th>
                  <th className="table-th">Tên Thực tập sinh</th>
                  <th className="table-th">Loại phụ cấp</th>
                  <th className="table-th">Số tiền</th>
                  <th className="table-th">Ngày áp dụng</th>
                  <th className="table-th center">Ngày thanh toán</th>
                  <th className="table-th center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((item, index) => (
                  <tr key={item.allowanceId}>
                    <td className="table-td center">{index + 1}</td>
                    <td className="table-td">
                      <strong>{item.internName}</strong>
                    </td>
                    <td className="table-td">{item.allowanceType || "N/A"}</td>
                    <td className="table-td">
                      <strong style={{ color: "var(--success)" }}>
                        {formatCurrency(item.amount)}
                      </strong>
                    </td>
                    <td className="table-td">{formatDate(item.date)}</td>
                    <td className="table-td center">
                      {item.paidAt ? (
                        <span className="badge badge-approved">
                          {formatDate(item.paidAt)}
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="table-td center">
                      <div className="action-buttons ">
                        <button
                          className="btn btn-danger btn-sm "
                          onClick={() =>
                            handleDeleteAllowance(item.allowanceId)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAllowanceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAllowance}
        />
      )}
    </div>
  );
}

function CreateAllowanceModal({ onClose, onCreate }) {
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [allowanceType, setAllowanceType] = useState("Ăn trưa");
  const [amount, setAmount] = useState("");
  const [applyDate, setApplyDate] = useState(null);
  const [note, setNote] = useState("");
  const [showInternModal, setShowInternModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!selectedIntern) errors.intern = "Vui lòng chọn thực tập sinh";
    if (!allowanceType) errors.type = "Vui lòng chọn loại phụ cấp";
    if (!amount || amount <= 0) errors.amount = "Số tiền phải là số dương";
    if (!applyDate) errors.date = "Vui lòng chọn ngày áp dụng";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onCreate({
      internId: selectedIntern?.intern_id || selectedIntern?.id,
      allowanceType: allowanceType,
      amount: parseFloat(amount),
      date: applyDate ? applyDate.format("YYYY-MM-DD") : "",
      note: note || "",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm Phụ cấp cho Thực tập sinh</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">
                Thực tập sinh <span className="required">*</span>
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className={`form-input ${
                    validationErrors.intern ? "input-error" : ""
                  }`}
                  readOnly
                  value={
                    selectedIntern
                      ? `${selectedIntern.student} (${selectedIntern.studentEmail})`
                      : ""
                  }
                  placeholder="Chọn một thực tập sinh từ danh sách"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInternModal(true)}
                >
                  Chọn
                </button>
              </div>
              {validationErrors.intern && (
                <div className="error-message">{validationErrors.intern}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Loại phụ cấp <span className="required">*</span>
              </label>
              <select
                className={`form-select ${
                  validationErrors.type ? "input-error" : ""
                }`}
                value={allowanceType}
                onChange={(e) => setAllowanceType(e.target.value)}
              >
                <option value="Ăn trưa">Phụ cấp ăn trưa</option>
                <option value="Đi lại">Phụ cấp đi lại</option>
                <option value="Chuyên cần">Phụ cấp chuyên cần</option>
                <option value="Khác">Khác</option>
              </select>
              {validationErrors.type && (
                <div className="error-message">{validationErrors.type}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Số tiền (VND) <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`form-input ${
                  validationErrors.amount ? "input-error" : ""
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 500000"
                min="0"
              />
              {validationErrors.amount && (
                <div className="error-message">{validationErrors.amount}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Ngày áp dụng <span className="required">*</span>
              </label>
              <DatePicker
                format="DD/MM/YYYY"
                value={applyDate}
                onChange={(value) => setApplyDate(value)}
                style={{ width: "100%" }}
                status={validationErrors.date ? "error" : undefined}
                showToday={false}
              />
              {validationErrors.date && (
                <div className="error-message">{validationErrors.date}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea
                className="form-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm (không bắt buộc)"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>

      {showInternModal && (
        <InternSelectionModal
          onClose={() => setShowInternModal(false)}
          onSelect={(intern) => {
            console.log("Selected intern:", intern);
            setSelectedIntern(intern);
            setShowInternModal(false);
          }}
        />
      )}
    </div>
  );
}

CreateAllowanceModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
