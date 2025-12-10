import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProjectsByCurrentMentor,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectService";
import "./ProjectManagement.css";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    capacity: 1,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjectsByCurrentMentor();
      setProjects(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách project"
      );
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      capacity: 1,
    });
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      capacity: project.capacity || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        toast.success("Cập nhật project thành công! 🎉");
      } else {
        await createProject(formData);
        toast.success("Tạo project mới thành công! 🎉");
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      console.error("Error saving project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Bạn có chắc muốn xóa project này?")) return;

    setLoading(true);
    try {
      await deleteProject(projectId);
      toast.success("Xóa project thành công!");
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xóa project");
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý Project</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Tạo Project Mới
        </button>
      </div>

      {/* Content */}
      <div className="card">
        {loading && !showModal ? (
          <div className="loading center">
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📁</div>
            <div className="empty-text">Chưa có project nào</div>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="card-header">
                  <h3>{project.title}</h3>
                  <span className="capacity-badge">
                    {project.internNames?.length || 0}/{project.capacity}
                  </span>
                </div>

                <p className="card-description">
                  {project.description || "Chưa có mô tả"}
                </p>

                <div className="card-info">
                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <div className="info-content">
                      <span className="info-label">Số lượng:</span>
                      <span className="info-value">
                        {project.capacity} vị trí
                      </span>
                    </div>
                  </div>

                  {project.mentorName && (
                    <div className="info-item">
                      <span className="info-icon">👨‍🏫</span>
                      <div className="info-content">
                        <span className="info-label">Mentor:</span>
                        <span className="info-value">{project.mentorName}</span>
                      </div>
                    </div>
                  )}

                  {project.internNames && project.internNames.length > 0 && (
                    <div className="info-item">
                      <span className="info-icon">👨‍💻</span>
                      <div className="info-content">
                        <span className="info-label">Interns:</span>
                        <div className="intern-list">
                          {project.internNames
                            .slice(0, 3)
                            .map((intern, index) => (
                              <span
                                key={intern.id || index}
                                className="intern-tag"
                              >
                                {intern.fullName}
                              </span>
                            ))}
                          {project.internNames.length > 3 && (
                            <span className="intern-tag more">
                              +{project.internNames.length - 3} khác
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(project)}
                    disabled={loading}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(project.id)}
                    disabled={loading}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProject ? "Chỉnh sửa Project" : "Tạo Project Mới"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Tên Project <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên project (vd: AI Internship Program)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Nhập mô tả chi tiết về project..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    Số lượng vị trí <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    className="form-input"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Nhập số lượng intern có thể tham gia"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseModal}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Đang lưu..."
                      : editingProject
                      ? "Cập nhật"
                      : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
