// src/pages/hr/MentorManagement.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllProjects,
  addInternToProject,
  transferInternToAnotherProject,
  removeInternFromProject,
  filterProjects,
} from "../../services/projectService";
import { getAllPrograms } from "../../services/programService";
import { getDepartmentsByProgram } from "../../services/departmentService";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import "./MentorManagement.css";

export default function HRProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [showInternMenu, setShowInternMenu] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    loadProjects();
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      loadDepartments(selectedProgramId);
      loadProjectsByFilter(selectedProgramId, selectedDepartmentId);
    } else {
      setDepartments([]);
      setSelectedDepartmentId("");
      loadProjects();
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (selectedProgramId) {
      loadProjectsByFilter(selectedProgramId, selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  const loadPrograms = async () => {
    try {
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (err) {
      console.error("Error loading programs:", err);
    }
  };

  const loadDepartments = async (programId) => {
    try {
      const data = await getDepartmentsByProgram(programId);
      setDepartments(data);
    } catch (err) {
      console.error("Error loading departments:", err);
      setDepartments([]);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách dự án"
      );
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectsByFilter = async (programId, departmentId = null) => {
    setLoading(true);
    try {
      const data = await filterProjects(programId, departmentId);
      setProjects(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách dự án"
      );
      console.error("Error filtering projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntern = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleSelectIntern = async (intern) => {
    if (!selectedProject) return;

    setLoading(true);

    try {
      const internId =
        intern?.intern_id || intern?.internProfileId || intern?.id;

      if (!internId) {
        toast.error("Không tìm thấy ID thực tập sinh!");
        setLoading(false);
        return;
      }

      if (intern.programId || intern.projectId || intern.currentProject) {
        toast.error("Thực tập sinh này đã thuộc một dự án khác!");
        setLoading(false);
        return;
      }

      await addInternToProject(selectedProject.id, internId);

      toast.success(
        `Đã thêm ${intern.student || intern.fullName} vào dự án ${
          selectedProject.title
        }`
      );
      setShowModal(false);

      if (selectedProgramId) {
        await loadProjectsByFilter(selectedProgramId, selectedDepartmentId);
      } else {
        await loadProjects();
      }
    } catch (err) {
      console.error("Error adding intern:", err);
      toast.error(
        err.response?.data?.message || "Không thể thêm thực tập sinh vào dự án"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIntern = async (internId, internName, projectTitle) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa "${internName}" khỏi dự án "${projectTitle}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setShowInternMenu(null);

    let isSuccess = false;

    try {
      await removeInternFromProject(internId);
      isSuccess = true;
    } catch (err) {
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_INCOMPLETE_CHUNKED_ENCODING"
      ) {
        console.log("Network error but API might succeed:", err.code);
        isSuccess = true;
      } else if (err.response?.status === 200 || err.response?.status === 204) {
        isSuccess = true;
      } else {
        console.error("Real error:", err);
        toast.error(
          err.response?.data?.message || "Không thể xóa thực tập sinh"
        );
      }
    }

    if (selectedProgramId) {
      await loadProjectsByFilter(selectedProgramId, selectedDepartmentId);
    } else {
      await loadProjects();
    }

    if (isSuccess) {
      toast.success(`Đã xóa ${internName} khỏi dự án`);
    }

    setLoading(false);
  };

  const handleOpenTransfer = (internId, internName, currentProjectId) => {
    setTransferData({ internId, internName, currentProjectId });
    setShowTransferModal(true);
    setShowInternMenu(null);
  };

  const handleTransferIntern = async (newProjectId) => {
    if (!transferData || !newProjectId) return;

    setLoading(true);

    let isSuccess = false;

    try {
      await transferInternToAnotherProject(transferData.internId, newProjectId);
      isSuccess = true;
    } catch (err) {
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_INCOMPLETE_CHUNKED_ENCODING"
      ) {
        console.log("Network error but API might succeed:", err.code);
        isSuccess = true;
      } else if (err.response?.status === 200 || err.response?.status === 204) {
        isSuccess = true;
      } else {
        console.error("Real error:", err);
        toast.error(
          err.response?.data?.message || "Không thể chuyển thực tập sinh"
        );
      }
    }

    if (selectedProgramId) {
      await loadProjectsByFilter(selectedProgramId, selectedDepartmentId);
    } else {
      await loadProjects();
    }

    if (isSuccess) {
      const newProject = projects.find((p) => p.id === newProjectId);
      toast.success(
        `Đã chuyển ${transferData.internName} sang dự án "${newProject?.title}"`
      );
      setShowTransferModal(false);
      setTransferData(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowInternMenu(null);
    if (showInternMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showInternMenu]);

  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "full" &&
        project.internNames?.length >= project.capacity) ||
      (filterStatus === "available" &&
        project.internNames?.length < project.capacity);

    return matchSearch && matchStatus;
  });

  const getStatusInfo = (project) => {
    const current = project.internNames?.length || 0;
    const total = project.capacity || 0;
    const isFull = current >= total;

    return {
      current,
      total,
      isFull,
      percentage: total > 0 ? (current / total) * 100 : 0,
    };
  };

  // Calculate statistics
  const stats = {
    total: filteredProjects.length,
    totalInterns: filteredProjects.reduce(
      (sum, p) => sum + (p.internNames?.length || 0),
      0
    ),
    totalCapacity: filteredProjects.reduce(
      (sum, p) => sum + (p.capacity || 0),
      0
    ),
    availableProjects: filteredProjects.filter(
      (p) => (p.internNames?.length || 0) < p.capacity
    ).length,
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý Dự án</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedProgramId("");
            setSelectedDepartmentId("");
            setSearchTerm("");
            setFilterStatus("all");
            loadProjects();
          }}
          disabled={loading}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng dự án</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {stats.totalInterns}
            </div>
            <div className="stat-label">Tổng thực tập sinh</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-total">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalCapacity}</div>
            <div className="stat-label">Tổng sức chứa</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {stats.availableProjects}
            </div>
            <div className="stat-label">Dự án còn chỗ</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card filters-card">
        <div className="filters-grid-mentor">
          {/* Search */}
          <div className="form-group">
            <label className="form-label">Tìm kiếm</label>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Tìm theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Program Filter */}
          <div className="form-group">
            <label className="form-label">Chương trình</label>
            <select
              className="form-select"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="">📋 Tất cả chương trình</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.programName}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="form-group">
            <label className="form-label">Phòng ban</label>
            <select
              className="form-select"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              disabled={!selectedProgramId}
            >
              <option value="">🏢 Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div className="filter-buttons">
              <button
                className={`btn btn-sm filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("all")}
              >
                Tất cả
              </button>
              <button
                className={`btn btn-sm filter-btn ${
                  filterStatus === "available" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("available")}
              >
                Còn chỗ
              </button>
              <button
                className={`btn btn-sm filter-btn ${
                  filterStatus === "full" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("full")}
              >
                Đã đủ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="card">
        {loading ? (
          <div className="loading center">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📂</div>
            <div className="empty-text">
              {projects.length === 0
                ? "Chưa có dự án nào"
                : "Không tìm thấy dự án phù hợp"}
            </div>
          </div>
        ) : (
          <div className="hr-project-grid">
            {filteredProjects.map((project) => {
              const status = getStatusInfo(project);
              return (
                <div key={project.id} className="hr-project-card">
                  <div className="card-header">
                    <h3>{project.title}</h3>
                    {status.isFull && <span className="badge-full">Đã đủ</span>}
                  </div>

                  <p className="card-description">
                    {project.description || "Chưa có mô tả"}
                  </p>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">
                        Số lượng thực tập sinh
                      </span>
                      <span className="progress-count">
                        {status.current}/{status.total}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          status.isFull ? "full" : ""
                        }`}
                        style={{
                          width: `${Math.min(status.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {project.mentorName && (
                    <div className="card-info-item">
                      <span className="info-icon">👨‍🏫</span>
                      <span className="info-text">
                        <strong>Mentor:</strong> {project.mentorName}
                      </span>
                    </div>
                  )}

                  {project.internNames && project.internNames.length > 0 && (
                    <div className="intern-section">
                      <div className="intern-header">
                        <span className="intern-icon">👥</span>
                        <span className="intern-label">Thực tập sinh:</span>
                      </div>
                      <div className="intern-tags">
                        {project.internNames.slice(0, 5).map((intern) => (
                          <div
                            key={intern.id}
                            className="intern-tag-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInternMenu({
                                projectId: project.id,
                                projectTitle: project.title,
                                internName: intern.fullName,
                                internId: intern.id,
                              });
                            }}
                          >
                            <span className="intern-tag">
                              {intern.fullName}
                            </span>
                            {showInternMenu?.internId === intern.id &&
                              showInternMenu?.projectId === project.id && (
                                <div
                                  className="intern-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="menu-item transfer"
                                    onClick={() =>
                                      handleOpenTransfer(
                                        intern.id,
                                        intern.fullName,
                                        project.id
                                      )
                                    }
                                  >
                                    🔄 Chuyển sang dự án khác
                                  </button>
                                  <button
                                    className="menu-item remove"
                                    onClick={() =>
                                      handleRemoveIntern(
                                        intern.id,
                                        intern.fullName,
                                        project.title
                                      )
                                    }
                                  >
                                    🗑️ Xóa khỏi dự án
                                  </button>
                                </div>
                              )}
                          </div>
                        ))}
                        {project.internNames.length > 5 && (
                          <div className="intern-tag-wrapper">
                            <span className="intern-tag more">
                              +{project.internNames.length - 5} khác
                            </span>
                            <div className="intern-tooltip">
                              <div className="tooltip-header">
                                Tất cả thực tập sinh (
                                {project.internNames.length})
                              </div>
                              <div className="tooltip-list">
                                {project.internNames.map((intern, index) => (
                                  <div
                                    key={intern.id}
                                    className="tooltip-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowInternMenu({
                                        projectId: project.id,
                                        projectTitle: project.title,
                                        internName: intern.fullName,
                                        internId: intern.id,
                                      });
                                    }}
                                  >
                                    <span className="tooltip-number">
                                      {index + 1}.
                                    </span>
                                    <span className="tooltip-name">
                                      {intern.fullName}
                                    </span>
                                    <span className="tooltip-action">⋮</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    className={`btn-add-intern ${
                      status.isFull ? "disabled" : ""
                    }`}
                    onClick={() => handleAddIntern(project)}
                    disabled={status.isFull || loading}
                  >
                    {status.isFull
                      ? "✓ Đã đủ số lượng"
                      : "+ Thêm thực tập sinh"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intern Selection Modal */}
      {showModal && (
        <InternSelectionModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectIntern}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferData && (
        <div
          className="modal-overlay"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div className="modal-header">
              <h2 className="modal-title">🔄 Chuyển thực tập sinh</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowTransferModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="transfer-info">
                <div className="info-badge">
                  <span className="badge-icon">👤</span>
                  <span className="badge-text">{transferData.internName}</span>
                </div>
                <div className="arrow-icon">→</div>
                <div className="info-label">Chọn dự án đích</div>
              </div>

              <div className="project-select-list">
                {projects
                  .filter((p) => p.id !== transferData.currentProjectId)
                  .map((project) => {
                    const status = getStatusInfo(project);
                    return (
                      <button
                        key={project.id}
                        className={`project-select-item ${
                          status.isFull ? "disabled" : ""
                        }`}
                        onClick={() =>
                          !status.isFull && handleTransferIntern(project.id)
                        }
                        disabled={status.isFull || loading}
                      >
                        <div className="project-select-info">
                          <div className="project-select-title">
                            {project.title}
                          </div>
                          <div className="project-select-capacity">
                            {status.current}/{status.total} vị trí
                          </div>
                        </div>
                        {status.isFull ? (
                          <span className="project-status full">Đã đủ</span>
                        ) : (
                          <span className="project-status available">
                            Còn chỗ
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
