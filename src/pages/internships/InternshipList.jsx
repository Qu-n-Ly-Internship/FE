import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import "./InternshipList.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getInternships,
  createInternship,
  updateInternship,
  getInternPrograms,
} from "../../services/internshipService";
import { getUsers } from "../../services/adminService";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [programs, setPrograms] = useState([]);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadInternships();
    loadPrograms();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function loadPrograms() {
    try {
      const response = await getInternPrograms();
      setPrograms(response.data || []);
    } catch (error) {
      console.error("Error loading programs:", error);
    }
  }

  async function loadInternships() {
    setLoading(true);
    try {
      const response = await getInternships({
        q: "",
        status: "",
        page: 0,
        size: 1000,
      });
      setInternships(response.data || []);
    } catch (error) {
      console.error("Error loading internships:", error);
      toast.error("Không thể tải danh sách thực tập");
    } finally {
      setLoading(false);
    }
  }

  const schools = [
    ...new Set(internships.map((it) => it.school).filter(Boolean)),
  ];
  const majors = [
    ...new Set(internships.map((it) => it.major).filter(Boolean)),
  ];

  const filteredInternships = internships.filter((it) => {
    const matchesSearch = searchText
      ? it.student?.toLowerCase().includes(searchText.toLowerCase()) ||
        it.studentEmail?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesSchool = schoolFilter ? it.school === schoolFilter : true;
    const matchesMajor = majorFilter ? it.major === majorFilter : true;
    return matchesSearch && matchesSchool && matchesMajor;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, schoolFilter, majorFilter]);

  const totalItems = filteredInternships.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredInternships.slice(
    startIndex,
    startIndex + pageSize
  );

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (n) => pages.push(n);
    add(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) add(i);
    if (right < totalPages - 1) pages.push("...");
    add(totalPages);
    return pages;
  }

  function clearFilters() {
    setSearchText("");
    setSchoolFilter("");
    setMajorFilter("");
  }

  async function handleCreate(data) {
    try {
      const payload = {
        title: data.title,
        student: data.student,
        studentEmail: data.studentEmail,
        school: data.school,
        major: data.major,
        status: data.status,
        startDate: data.startDate
          ? dayjs(data.startDate).format("YYYY-MM-DD")
          : null,
        endDate: data.endDate ? dayjs(data.endDate).format("YYYY-MM-DD") : null,
      };

      await createInternship(payload);

      setNotification({
        type: "success",
        message: "Tạo thực tập sinh thành công! 🎉",
        details: `${data.student} - ${data.title}`,
      });

      setShowCreate(false);
      await loadInternships();
    } catch (error) {
      console.error("Error creating internship:", error);
      setNotification({
        type: "error",
        message: "Tạo thất bại",
        details:
          error?.response?.data?.message ||
          error?.message ||
          "Vui lòng thử lại",
      });
    }
  }

  async function handleUpdate(internId, updated) {
    try {
      await updateInternship(internId, {
        title: updated.title,
        student: updated.student,
        studentEmail: updated.studentEmail,
        school: updated.school,
        major: updated.major,
        status: updated.status,
        startDate: updated.startDate,
        endDate: updated.endDate,
      });

      setNotification({
        type: "success",
        message: "Cập nhật thành công! ✅",
        details: `${updated.student} - ${updated.title}`,
      });

      setEditing(null);
      await loadInternships();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Cập nhật thất bại",
        details: error?.response?.data?.message || "Vui lòng thử lại",
      });
    }
  }

  async function handleComplete(internship) {
    if (!window.confirm("Bạn có chắc muốn đánh dấu hoàn thành?")) return;

    try {
      await updateInternship(internship.intern_id, {
        title: internship.title,
        student: internship.student,
        studentEmail: internship.studentEmail,
        school: internship.school,
        major: internship.major,
        status: "completed",
        startDate: internship.startDate,
        endDate: dayjs().format("YYYY-MM-DD"),
      });

      setNotification({
        type: "success",
        message: "Đã cập nhật trạng thái thành 'Hoàn thành'",
        details: `${internship.student}`,
      });

      await loadInternships();
    } catch (error) {
      console.error("Error updating internship status:", error);
      setNotification({
        type: "error",
        message: "Cập nhật thất bại",
        details: error.response?.data?.message || "Vui lòng thử lại",
      });
    }
  }

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container internship-list-container">


      <div className="page-header">
        <h1 className="page-title">Danh sách Thực tập</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          Thêm thực tập mới
        </button>
      </div>

      {notification && (
        <InlineNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tìm kiếm (Tên/Email)</label>
            <input
              className="form-input"
              placeholder="Nhập tên hoặc email"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lọc theo Trường</label>
            <select
              className="form-select"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lọc theo Ngành</label>
            <select
              className="form-select"
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filteredInternships.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔭</div>
            <div className="empty-text">
              {internships.length === 0
                ? "Chưa có thực tập sinh nào"
                : "Không tìm thấy thực tập sinh phù hợp"}
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table internship-table">
                <thead>
                  <tr>
                    <th className="table-th">STT</th>
                    <th className="table-th">Vị trí</th>
                    <th className="table-th">Tên sinh viên</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Trường</th>
                    <th className="table-th">Ngành</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Thời gian</th>
                    <th className="table-th">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((internship, index) => (
                    <tr key={internship.intern_id}>
                      <td className="table-td center">
                        {startIndex + index + 1}
                      </td>
                      <td className="table-td">{internship.title}</td>
                      <td className="table-td">
                        <div className="internship-student-info">
                          <span className="internship-student-name">
                            {internship.student}
                          </span>
                          <span className="internship-student-email">
                            {internship.studentEmail}
                          </span>
                        </div>
                      </td>
                      <td className="table-td">{internship.studentEmail}</td>
                      <td className="table-td">{internship.school || "-"}</td>
                      <td className="table-td">{internship.major || "-"}</td>
                      <td className="table-td">
                        <span
                          className={`badge ${
                            internship.status === "active"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {internship.status === "active"
                            ? "Đang thực tập"
                            : "Hoàn thành"}
                        </span>
                      </td>
                      <td className="table-td">
                        {internship.startDate} - {internship.endDate}
                      </td>
                      <td className="table-td">
                        <div className="action-buttons">
                          <button
                            className="btn btn-success btn-sm "
                            onClick={() => setViewing(internship)}
                          >
                            Xem
                          </button>
                          <button
                            className="btn btn-warning btn-sm "
                            onClick={() => setEditing(internship)}
                          >
                            Sửa
                          </button>
                          {internship.status === "active" && (
                            <button
                              className="btn btn-info btn-sm "
                              onClick={() => handleComplete(internship)}
                            >
                              Hoàn thành
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Hiển thị {totalItems === 0 ? 0 : startIndex + 1}–
                  {Math.min(startIndex + pageSize, totalItems)} trên{" "}
                  {totalItems}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ‹ Trước
                  </button>

                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="page-dots">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`btn btn-sm page-btn ${
                          p === currentPage ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="btn btn-secondary  btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateInternshipModal
          onClose={() => setShowCreate(false)}
          existingInternships={internships}
          programs={programs}
          onCreate={handleCreate}
        />
      )}

      {viewing && (
        <ViewInternshipModal data={viewing} onClose={() => setViewing(null)} />
      )}

      {editing && (
        <EditInternshipModal
          data={editing}
          programs={programs}
          onClose={() => setEditing(null)}
          onSave={(updated) => handleUpdate(editing.intern_id, updated)}
        />
      )}
    </div>
  );
}

// Inline Notification Component
function InlineNotification({ type, message, details, onClose }) {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const colors = {
    success: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    error: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    warning: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        padding: "16px 20px",
        borderRadius: "8px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <div style={{ fontSize: "24px", flexShrink: 0 }}>{icons[type]}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: "600",
            color: style.text,
            fontSize: "16px",
            marginBottom: "4px",
          }}
        >
          {message}
        </div>
        {details && (
          <div style={{ color: style.text, fontSize: "14px", opacity: 0.8 }}>
            {details}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: style.text,
          cursor: "pointer",
          fontSize: "20px",
          padding: "0",
          lineHeight: "1",
          opacity: 0.6,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
      >
        ×
      </button>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// Create Modal
function CreateInternshipModal({
  onClose,
  onCreate,
  existingInternships = [],
  programs = [],
}) {
  const [title, setTitle] = useState("");
  const [student, setStudent] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showSelectIntern, setShowSelectIntern] = useState(false);

  const validate = (data) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.title.trim()) errors.title = "Vị trí không được để trống";
    if (!data.student.trim())
      errors.student = "Tên sinh viên không được để trống";
    if (!data.studentEmail.trim())
      errors.studentEmail = "Email không được để trống";
    else if (!emailRegex.test(data.studentEmail.trim()))
      errors.studentEmail = "Email không hợp lệ";
    if (!data.startDate) errors.startDate = "Ngày bắt đầu không được để trống";
    if (!data.endDate) errors.endDate = "Ngày kết thúc không được để trống";
    return errors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      student,
      studentEmail,
      school,
      major,
      status,
      startDate,
      endDate,
    };
    const errors = validate(data);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }
    onCreate({
      title: title.trim(),
      student: student.trim(),
      studentEmail: studentEmail.trim(),
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
      endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
    });
  };

  const handleDateChange = (setter, field) => (value) => {
    setter(value);
    if (validationErrors[field])
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (validationErrors[field])
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 className="modal-title" style={{ margin: 0 }}>
            Thêm thực tập sinh
          </h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowSelectIntern(true)}
          >
            Chọn từ danh sách INTERN
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Vị trí <span className="required">*</span>
              </label>
              <select
                className={`form-select ${
                  validationErrors.title ? "input-error" : ""
                }`}
                value={title}
                onChange={handleInputChange(setTitle, "title")}
              >
                <option value="">Chọn vị trí</option>
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${
                  validationErrors.studentEmail ? "input-error" : ""
                }`}
                value={studentEmail}
                onChange={handleInputChange(setStudentEmail, "studentEmail")}
                placeholder="name@example.com"
              />
              {validationErrors.studentEmail && (
                <div className="error-message">
                  {validationErrors.studentEmail}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Tên sinh viên <span className="required">*</span>
              </label>
              <input
                className={`form-input ${
                  validationErrors.student ? "input-error" : ""
                }`}
                value={student}
                onChange={handleInputChange(setStudent, "student")}
              />
              {validationErrors.student && (
                <div className="error-message">{validationErrors.student}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Trường</label>
              <input
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="VD: Đại học Bách Khoa Hà Nội"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngành</label>
              <input
                className="form-input"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="VD: Công nghệ thông tin"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Đang thực tập</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <DatePicker
                format="YYYY-MM-DD"
                value={startDate}
                onChange={handleDateChange(setStartDate, "startDate")}
                className="app-date-picker"
                status={validationErrors.startDate ? "error" : undefined}
                showToday={false}
              />
              {validationErrors.startDate && (
                <div className="error-message">
                  {validationErrors.startDate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <DatePicker
                format="YYYY-MM-DD"
                value={endDate}
                onChange={handleDateChange(setEndDate, "endDate")}
                className="app-date-picker"
                status={validationErrors.endDate ? "error" : undefined}
                showToday={false}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Tạo
            </button>
          </div>
        </form>

        {showSelectIntern && (
          <SelectInternModal
            onClose={() => setShowSelectIntern(false)}
            onSelect={(user) => {
              setStudent(user.fullName);
              setStudentEmail(user.email);
              setValidationErrors((prev) => ({
                ...prev,
                student: undefined,
                studentEmail: undefined,
              }));
              setShowSelectIntern(false);
            }}
            existingInternships={existingInternships}
          />
        )}
      </div>
    </div>
  );
}

// View Modal
function ViewInternshipModal({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thông tin thực tập</h2>
        <div className="info-row">
          <span className="info-label">Vị trí:</span>
          <span className="info-value">{data.title}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Sinh viên:</span>
          <span className="info-value">{data.student}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{data.studentEmail}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Trường:</span>
          <span className="info-value">{data.school || "-"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Ngành:</span>
          <span className="info-value">{data.major || "-"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Trạng thái:</span>
          <span className="info-value">
            {data.status === "active" ? "Đang thực tập" : "Hoàn thành"}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Thời gian:</span>
          <span className="info-value">
            {data.startDate} - {data.endDate}
          </span>
        </div>
        <div className="form-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Modal
function EditInternshipModal({ data, onClose, onSave, programs = [] }) {
  const [title, setTitle] = useState(data.title || "");
  const [student, setStudent] = useState(data.student || "");
  const [studentEmail, setStudentEmail] = useState(data.studentEmail || "");
  const [school, setSchool] = useState(data.school || "");
  const [major, setMajor] = useState(data.major || "");
  const [status, setStatus] = useState(data.status || "active");
  const [startDate, setStartDate] = useState(
    data.startDate ? dayjs(data.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    data.endDate ? dayjs(data.endDate) : null
  );
  const [validationErrors, setValidationErrors] = useState({});

  const handleDateChange = (setter, field) => (date) => {
    setter(date);
    if (validationErrors[field])
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (d) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!d.title.trim()) errors.title = "Vị trí không được để trống";
    if (!d.student.trim()) errors.student = "Tên sinh viên không được để trống";
    if (!d.studentEmail.trim())
      errors.studentEmail = "Email không được để trống";
    else if (!emailRegex.test(d.studentEmail.trim()))
      errors.studentEmail = "Email không hợp lệ";
    if (!d.startDate) errors.startDate = "Ngày bắt đầu không được để trống";
    if (!d.endDate) errors.endDate = "Ngày kết thúc không được để trống";
    return errors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const updated = {
      title,
      student,
      studentEmail,
      school,
      major,
      status,
      startDate,
      endDate,
    };
    const errors = validate(updated);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }
    onSave({
      ...data,
      title: title.trim(),
      student: student.trim(),
      studentEmail: studentEmail.trim(),
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
    });
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (validationErrors[field])
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Sửa thông tin thực tập</h2>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Vị trí <span className="required">*</span>
              </label>
              <select
                className={`form-select ${
                  validationErrors.title ? "input-error" : ""
                }`}
                value={title}
                onChange={handleInputChange(setTitle, "title")}
              >
                <option value="">-- Chọn vị trí --</option>
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${
                  validationErrors.studentEmail ? "input-error" : ""
                }`}
                value={studentEmail}
                onChange={handleInputChange(setStudentEmail, "studentEmail")}
                placeholder="name@example.com"
              />
              {validationErrors.studentEmail && (
                <div className="error-message">
                  {validationErrors.studentEmail}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Sinh viên <span className="required">*</span>
              </label>
              <input
                className={`form-input ${
                  validationErrors.student ? "input-error" : ""
                }`}
                value={student}
                onChange={handleInputChange(setStudent, "student")}
              />
              {validationErrors.student && (
                <div className="error-message">{validationErrors.student}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Trường</label>
              <input
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngành</label>
              <input
                className="form-input"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Đang thực tập</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <DatePicker
                format="YYYY-MM-DD"
                value={startDate}
                onChange={handleDateChange(setStartDate, "startDate")}
                className="app-date-picker"
                status={validationErrors.startDate ? "error" : undefined}
                showToday={false}
              />
              {validationErrors.startDate && (
                <div className="error-message">
                  {validationErrors.startDate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <DatePicker
                format="YYYY-MM-DD"
                value={endDate}
                onChange={handleDateChange(setEndDate, "endDate")}
                className="app-date-picker"
                status={validationErrors.endDate ? "error" : undefined}
                showToday={false}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Select Intern Modal
function SelectInternModal({ onClose, onSelect, existingInternships = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadInternUsers();
  }, []);

  async function loadInternUsers() {
    setLoading(true);
    try {
      const response = await getUsers({ role: "INTERN", status: "" });
      const userList = response.content || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error loading INTERN users:", error);
      toast.error("Không thể tải danh sách INTERN");
    } finally {
      setLoading(false);
    }
  }

  const existingEmails = new Set(
    existingInternships
      .map((intern) => intern.studentEmail?.toLowerCase())
      .filter(Boolean)
  );

  const filteredUsers = users.filter((user) => {
    if (existingEmails.has(user.email?.toLowerCase())) return false;
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="modal-overlay">
      <div className="modal-box select-intern-modal">
        <h2 className="modal-title">Chọn INTERN từ danh sách người dùng</h2>

        <div className="form-group select-intern-search">
          <input
            className="form-input"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading center" style={{ padding: 20 }}>
            Đang tải...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty" style={{ padding: 20 }}>
            <div className="empty-text">Không tìm thấy user có role INTERN</div>
          </div>
        ) : (
          <div className="select-intern-list">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">Họ tên</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="table-td">{user.fullName}</td>
                    <td className="table-td">{user.email}</td>
                    <td className="table-td">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onSelect(user)}
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
