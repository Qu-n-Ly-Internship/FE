import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../../store/authStore";
import "./InternshipProgramList.css";

import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../services/programService";

import { getDepartmentsByProgram } from "../../services/departmentService";

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    console.error("Invalid date format:", dateString);
    return dateString;
  }
}

export default function InternshipProgramList() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  // State for filters
  const [nameFilter, setNameFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // 📥 Load danh sách chương trình từ API
  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        const data = await getAllPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Load programs error:", error);
        toast.error("Không thể tải danh sách chương trình! Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  // ➕ Tạo chương trình
  const handleCreateProgram = async (newProgramData) => {
    const { userId, ...programData } = newProgramData;

    try {
      await createProgram(programData, userId);
      toast.success("Tạo chương trình thành công! 🎉");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
      setShowCreate(false);
    } catch (error) {
      console.error("Create program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo chương trình!";
      toast.error(errorMsg);
    }
  };

  // ✏️ Cập nhật chương trình
  const handleUpdateProgram = async (updatedData) => {
    try {
      await updateProgram(updatedData.id, updatedData);
      toast.success("Cập nhật chương trình thành công! ✅");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
      setEditing(null);
    } catch (error) {
      console.error("Update program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật chương trình!";
      toast.error(errorMsg);
    }
  };

  // 🗑️ Xóa chương trình
  const handleDeleteProgram = async (id) => {
    if (
      !window.confirm(
        "⚠️ Bạn có chắc chắn muốn xóa chương trình này không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      await deleteProgram(id);
      toast.success("Đã xóa chương trình thành công! 🗑️");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Delete program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa chương trình!";
      toast.error(errorMsg);
    }
  };

  // Lọc danh sách chương trình
  const filteredPrograms = programs.filter((program) => {
    const nameMatch = program.programName
      .toLowerCase()
      .includes(nameFilter.toLowerCase());

    const startDate = startDateFilter ? new Date(startDateFilter) : null;
    const endDate = endDateFilter ? new Date(endDateFilter) : null;
    const programDate = new Date(program.dateCreate);

    if (startDate && programDate < startDate) {
      return false;
    }
    if (endDate && programDate > endDate) {
      return false;
    }

    return nameMatch;
  });

  const clearFilters = () => {
    setNameFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading center">Đang tải danh sách chương trình...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <h1 className="page-title">Chương trình Thực tập</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          Tạo chương trình mới
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Lọc theo tên</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập tên chương trình..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Từ ngày</label>
            <input
              type="date"
              className="form-input"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Đến ngày</label>
            <input
              type="date"
              className="form-input"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="internship-table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="table-th">STT</th>
                <th className="table-th">Tên chương trình</th>
                <th className="table-th">Ngày bắt đầu</th>
                <th className="table-th">Ngày kết thúc</th>
                <th className="table-th">Mô tả</th>
                <th className="table-th">Người khởi tạo</th>
                <th className="table-th">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td className="table-td center" colSpan={7}>
                    Không tìm thấy chương trình nào.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((program, index) => (
                  <tr key={program.id}>
                    <td className="table-td center">{index + 1}</td>
                    <td className="table-td">{program.programName}</td>
                    <td className="table-td">
                      {formatDate(program.dateCreate)}
                    </td>
                    <td className="table-td">{formatDate(program.dateEnd)}</td>
                    <td className="table-td">
                      <div
                        className="text-truncate"
                        title={program.description}
                      >
                        {program.description}
                      </div>
                    </td>
                    <td className="table-td">{program.hrName || "Không rõ"}</td>
                    <td className="table-td">
                      <div className="action-buttons">
                        <button
                          className="btn-info btn btn-sm"
                          onClick={() =>
                            navigate(`/hr/departments/${program.id}`)
                          }
                          title="Xem chi tiết phòng ban"
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn-warning btn btn-sm"
                          onClick={() => setEditing(program)}
                          title="Chỉnh sửa chương trình"
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-danger  btn btn-sm"
                          onClick={() => handleDeleteProgram(program.id)}
                          title="Xóa chương trình"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateProgramModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateProgram}
        />
      )}

      {viewing && (
        <ViewProgramModal program={viewing} onClose={() => setViewing(null)} />
      )}

      {editing && (
        <EditProgramModal
          program={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdateProgram}
        />
      )}
    </div>
  );
}

// ==========================================================
// CREATE PROGRAM MODAL
// ==========================================================
function CreateProgramModal({ onClose, onCreate }) {
  const user = useAuthStore((state) => state.user);

  const [programName, setProgramName] = useState("");
  const [dateCreate, setDateCreate] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!programName.trim())
      errors.programName = "Tên chương trình không được để trống";
    if (!dateCreate) errors.dateCreate = "Ngày bắt đầu không được để trống";
    if (!dateEnd) errors.dateEnd = "Ngày kết thúc không được để trống";
    else if (dateCreate && dateEnd && dateEnd.isBefore(dateCreate, "day"))
      errors.dateEnd = "Ngày kết thúc phải sau ngày bắt đầu";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    const userId = user?.id;

    if (!userId) {
      toast.error(
        "Lỗi xác thực: Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!"
      );
      return;
    }

    const payload = {
      programName: programName.trim(),
      dateCreate: dateCreate ? dateCreate.format("YYYY-MM-DD") : "",
      dateEnd: dateEnd ? dateEnd.format("YYYY-MM-DD") : "",
      description: description.trim(),
      userId,
    };

    onCreate(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Tạo chương trình thực tập mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên chương trình *</label>
            <input
              className={`form-input ${
                validationErrors.programName ? "input-error" : ""
              }`}
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
            {validationErrors.programName && (
              <div className="error-message">
                {validationErrors.programName}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu *</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={dateCreate}
                onChange={(value) => setDateCreate(value)}
                className="app-date-picker"
                status={validationErrors.dateCreate ? "error" : undefined}
                showToday={false}
                style={{ width: "100%" }}
              />
              {validationErrors.dateCreate && (
                <div className="error-message">
                  {validationErrors.dateCreate}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Ngày kết thúc *</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={dateEnd}
                onChange={(value) => setDateEnd(value)}
                className="app-date-picker"
                status={validationErrors.dateEnd ? "error" : undefined}
                showToday={false}
                style={{ width: "100%" }}
              />
              {validationErrors.dateEnd && (
                <div className="error-message">{validationErrors.dateEnd}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-field"
              rows={8}
              style={{ width: "100%" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Tạo chương trình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateProgramModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

// ==========================================================
// VIEW PROGRAM MODAL
// ==========================================================
function ViewProgramModal({ program, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDepartments() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching departments for program ID:", program.id);
        const data = await getDepartmentsByProgram(program.id);
        setDepartments(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải departments:", err);
        setError("Không thể tải danh sách phòng ban.");
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
  }, [program.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          Chi tiết chương trình: {program.programName}
        </h2>
        <div className="modal-content-scroll">
          <div className="form-group">
            <label className="form-label">Tên chương trình</label>
            <div className="detail-value">{program.programName}</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu</label>
              <div className="detail-value">
                {formatDate(program.dateCreate)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày kết thúc</label>
              <div className="detail-value">{formatDate(program.dateEnd)}</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <div className="detail-value text-pre-wrap">
              {program.description || "Không có mô tả"}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Người khởi tạo</label>
            <div className="detail-value">{program.hrName || "Không rõ"}</div>
          </div>

          <div className="form-group section-title">
            <h3>Phòng ban thuộc chương trình</h3>
            {loading ? (
              <div className="loading center">Đang tải phòng ban...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : departments.length === 0 ? (
              <div className="info-message">
                Chưa có phòng ban nào trong chương trình này.
              </div>
            ) : (
              <ul className="department-list">
                {departments.map((d) => (
                  <li key={d.id} className="department-item">
                    <strong>{d.departmentName}</strong>
                    {d.description && (
                      <div className="text-sm">{d.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

ViewProgramModal.propTypes = {
  program: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ==========================================================
// EDIT PROGRAM MODAL
// ==========================================================
function EditProgramModal({ program, onClose, onSave }) {
  const [programName, setProgramName] = useState(program.programName);
  const [dateCreate, setDateCreate] = useState(
    program.dateCreate ? dayjs(program.dateCreate) : null
  );
  const [dateEnd, setDateEnd] = useState(
    program.dateEnd ? dayjs(program.dateEnd) : null
  );
  const [description, setDescription] = useState(program.description);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!programName.trim())
      errors.programName = "Tên chương trình không được để trống";
    if (!dateCreate) errors.dateCreate = "Ngày bắt đầu không được để trống";
    if (!dateEnd) errors.dateEnd = "Ngày kết thúc không được để trống";
    else if (dateCreate && dateEnd && dateEnd.isBefore(dateCreate, "day"))
      errors.dateEnd = "Ngày kết thúc phải sau ngày bắt đầu";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    onSave({
      id: program.id,
      programName: programName.trim(),
      dateCreate: dateCreate ? dateCreate.format("YYYY-MM-DD") : "",
      dateEnd: dateEnd ? dateEnd.format("YYYY-MM-DD") : "",
      description: description.trim(),
      hrId: program.hrId,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Chỉnh sửa chương trình</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên chương trình *</label>
            <input
              className={`form-input ${
                validationErrors.programName ? "input-error" : ""
              }`}
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
            {validationErrors.programName && (
              <div className="error-message">
                {validationErrors.programName}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu *</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={dateCreate}
                onChange={(value) => setDateCreate(value)}
                className="app-date-picker"
                status={validationErrors.dateCreate ? "error" : undefined}
                showToday={false}
                style={{ width: "100%" }}
              />
              {validationErrors.dateCreate && (
                <div className="error-message">
                  {validationErrors.dateCreate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Ngày kết thúc *</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={dateEnd}
                onChange={(value) => setDateEnd(value)}
                className="app-date-picker"
                status={validationErrors.dateEnd ? "error" : undefined}
                showToday={false}
                style={{ width: "100%" }}
              />
              {validationErrors.dateEnd && (
                <div className="error-message">{validationErrors.dateEnd}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-field"
              rows={8}
              style={{ width: "100%" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProgramModal.propTypes = {
  program: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
