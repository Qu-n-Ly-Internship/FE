import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/variables.css";
import "../../styles/buttons.css";
import "../../styles/cards-and-modals.css";
import "../../styles/forms.css";
import "./DepartmentManagement.css";
import {
  getDepartmentsByProgram,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getMentorsByDepartment,
  addMentorToDepartment,
  updateMentorDepartment,
  removeMentorFromDepartment,
} from "../../services/departmentService";
import MentorSelectionModal from "../../components/common/MentorSelectionModal";
import "./DepartmentManagement.css";

export default function DepartmentManagement() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [filterText, setFilterText] = useState("");

  // States cho mentor
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showMoveMentorModal, setShowMoveMentorModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Lấy danh sách department theo program
  useEffect(() => {
    if (!programId) {
      toast.error("Vui lòng truy cập qua một chương trình cụ thể.");
      navigate("/hr/internship-programs");
    } else {
      loadDepartmentsAndMentors(programId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  async function loadDepartmentsAndMentors(progId) {
    try {
      setLoading(true);
      const depts = await getDepartmentsByProgram(progId);

      const mentorPromises = depts.map((dept) =>
        getMentorsByDepartment(dept.id)
      );
      const mentorsData = await Promise.all(mentorPromises);

      const combined = depts.map((dept, i) => ({
        ...dept,
        mentors: mentorsData[i] || [],
      }));

      setDepartments(combined);
    } catch (error) {
      console.error("Failed to load departments & mentors:", error);
      toast.error("Không thể tải dữ liệu phòng ban và mentor.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadData() {
    if (programId) await loadDepartmentsAndMentors(programId);
  }

  // Tạo phòng ban
  const handleCreate = async (data) => {
    try {
      const payload = {
        nameDepartment: data.name,
        capacity: data.capacity ?? null,
      };

      await createDepartment(programId, payload);
      toast.success("Tạo phòng ban thành công!");
      setShowCreateModal(false);
      await reloadData();
    } catch (error) {
      console.error("Failed to create department:", error);
      toast.error("Lỗi khi tạo phòng ban!");
    }
  };

  // Cập nhật phòng ban
  const handleUpdate = async (id, data) => {
    try {
      const payload = {
        nameDepartment: data.name,
        description: data.description,
        capacity: data.capacity ?? null,
      };

      await updateDepartment(id, payload);
      toast.success("Cập nhật thành công!");
      setEditingDepartment(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error("Lỗi khi cập nhật phòng ban!");
    }
  };

  // Xóa phòng ban
  const handleDeleteDepartment = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) {
      try {
        await deleteDepartment(id);
        toast.success("Đã xóa phòng ban!");
        await reloadData();
      } catch (error) {
        console.error("Failed to delete department:", error);
        toast.error("Không thể xóa phòng ban này.");
      }
    }
  };

  // Thêm mentor vào department
  const handleAddMentor = async (departmentId, mentorId) => {
    try {
      await addMentorToDepartment(departmentId, mentorId);
      toast.success("Đã thêm mentor vào phòng ban!");
      setShowAddMentorModal(false);
      setSelectedDepartmentId(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to add mentor:", error);
      toast.error("Không thể thêm mentor vào phòng ban.");
    }
  };

  // Chuyển mentor sang department khác
  const handleMoveMentor = async (mentorId, newDepartmentId) => {
    try {
      await updateMentorDepartment(mentorId, newDepartmentId);
      toast.success("Đã chuyển mentor sang phòng ban mới!");
      setShowMoveMentorModal(false);
      setSelectedMentor(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to move mentor:", error);
      toast.error("Không thể chuyển mentor.");
    }
  };

  // Xóa mentor khỏi department
  const handleRemoveMentor = async (mentorId) => {
    if (window.confirm("Xóa mentor này khỏi phòng ban?")) {
      try {
        await removeMentorFromDepartment(mentorId);
        toast.success("Đã xóa mentor khỏi phòng ban!");
        await reloadData();
      } catch (error) {
        console.error("Failed to remove mentor:", error);
        toast.error("Không thể xóa mentor.");
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    (dept.departmentName || "").toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <div className="header-left">
          <button
            className="btn btn-outline btn-back"
            onClick={() => navigate("/hr/internship-programs")}
          >
            ← Quay lại
          </button>
          <h1 className="page-title">Quản lý Phòng ban & Mentor</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Thêm phòng ban
        </button>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Tìm kiếm</label>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Tìm kiếm theo tên phòng ban..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {filteredDepartments.length === 0 ? (
          <div className="empty-state">
            {filterText
              ? "Không tìm thấy phòng ban nào."
              : "Chưa có phòng ban nào trong chương trình này."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dept-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên phòng ban</th>
                  <th>Mentor</th>
                  <th>Sức chứa</th>
                  <th>Người tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept, index) => (
                  <tr key={dept.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{dept.departmentName}</strong>
                    </td>
                    <td>
                      <div className="mentor-list">
                        {dept.mentors?.length > 0 ? (
                          dept.mentors.map((m) => (
                            <div key={m.id} className="mentor-item">
                              <span className="mentor-name">
                                👨‍🏫 {m.name || m.fullName}
                              </span>
                              <div className="mentor-actions">
                                <button
                                  className="btn btn-icon btn-move"
                                  onClick={() => {
                                    setSelectedMentor(m);
                                    setShowMoveMentorModal(true);
                                  }}
                                  title="Chuyển sang phòng ban khác"
                                >
                                  🔄
                                </button>
                                <button
                                  className="btn btn-icon btn-remove"
                                  onClick={() => handleRemoveMentor(m.id)}
                                  title="Xóa khỏi phòng ban"
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <em className="no-mentor">Chưa có mentor</em>
                        )}
                        <button
                          className="btn btn-primary btn-add-mentor"
                          onClick={() => {
                            setSelectedDepartmentId(dept.id);
                            setShowAddMentorModal(true);
                          }}
                        >
                          + Thêm mentor
                        </button>
                      </div>
                    </td>
                    <td>{dept.capacity ?? "—"}</td>
                    <td>{dept.hrName || "Không rõ"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => setEditingDepartment(dept)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          🗑️ Xóa
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

      {/* Modal tạo/sửa department */}
      {showCreateModal && (
        <DepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {editingDepartment && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onSave={(data) => handleUpdate(editingDepartment.id, data)}
        />
      )}

      {/* Modal thêm mentor */}
      {showAddMentorModal && (
        <MentorSelectionModal
          onClose={() => {
            setShowAddMentorModal(false);
            setSelectedDepartmentId(null);
          }}
          onSelect={(mentor) => {
            handleAddMentor(selectedDepartmentId, mentor.id);
          }}
        />
      )}

      {/* Modal chuyển mentor */}
      {showMoveMentorModal && selectedMentor && (
        <MoveMentorModal
          mentor={selectedMentor}
          departments={departments}
          onClose={() => {
            setShowMoveMentorModal(false);
            setSelectedMentor(null);
          }}
          onMove={handleMoveMentor}
        />
      )}
    </div>
  );
}

// ===================== DepartmentModal =====================
function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department?.departmentName || "");
  const [capacity, setCapacity] = useState(department?.capacity ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Tên phòng ban không được để trống.");
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        capacity: capacity ? parseInt(capacity, 10) : null,
      });
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {department ? "✏️ Sửa phòng ban" : "➕ Tạo phòng ban mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên phòng ban *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Nhập tên phòng ban..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sức chứa</label>
            <input
              type="number"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={isSubmitting}
              placeholder="Nhập số lượng tối đa..."
              min="1"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "💾 Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

DepartmentModal.propTypes = {
  department: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// ===================== MoveMentorModal =====================
function MoveMentorModal({ mentor, departments, onClose, onMove }) {
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newDepartmentId) {
      return toast.error("Vui lòng chọn phòng ban đích.");
    }

    try {
      setIsSubmitting(true);
      await onMove(mentor.id, newDepartmentId);
    } catch (error) {
      console.error("Move mentor error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🔄 Chuyển mentor sang phòng ban khác</h2>

        <div className="mentor-info">
          <strong>Mentor:</strong> {mentor.name || mentor.fullName}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn phòng ban đích *</label>
            <select
              className="form-input"
              value={newDepartmentId}
              onChange={(e) => setNewDepartmentId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName} ({dept.mentors?.length || 0} mentor)
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "🔄 Chuyển"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

MoveMentorModal.propTypes = {
  mentor: PropTypes.object.isRequired,
  departments: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};
