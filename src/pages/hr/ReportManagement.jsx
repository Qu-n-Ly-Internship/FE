import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Users,
  BookOpen,
  Copy,
  Check,
  Star,
  Award,
  X,
  Plus,
  Trash2,
  Edit,
  Save,
  MessageSquare,
  FileText,
  TrendingUp,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";

import "./ReportManagement.css";

import { getAllPrograms } from "../../services/programService";
import { getDepartmentsByProgram } from "../../services/departmentService";
import { filterProjects } from "../../services/projectService";
import {
  getEvaluationsByIntern,
  getReportsByIntern,
  createReport,
  updateReport,
  deleteReport,
} from "../../services/reportService";

export default function ReportManagement() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [reports, setReports] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [copiedInternId, setCopiedInternId] = useState(null);
  const [showInternList, setShowInternList] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    summary: "",
    recommendations: "",
    overallScore: 0,
  });

  // Load programs once
  useEffect(() => {
    loadPrograms();
  }, []);

  // Auto load departments + projects when program changes
  useEffect(() => {
    if (selectedProgramId) {
      loadDepartments(selectedProgramId);
      loadProjects(selectedProgramId, null);
    } else {
      setDepartments([]);
      setProjects([]);
      setInterns([]);
      setSelectedDepartmentId("");
    }
  }, [selectedProgramId]);

  // Load projects when department changes
  useEffect(() => {
    if (selectedProgramId && selectedDepartmentId) {
      loadProjects(selectedProgramId, selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  // Load evaluations + reports when intern changes
  useEffect(() => {
    if (selectedIntern) {
      loadEvaluations(selectedIntern.id);
      loadReports(selectedIntern.id);
    }
  }, [selectedIntern]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAllPrograms();
      setPrograms(data);

      // 🔥 Auto chọn chương trình đầu tiên
      if (data.length > 0) {
        setSelectedProgramId(data[0].id);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách chương trình");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async (programId) => {
    try {
      setLoading(true);
      const data = await getDepartmentsByProgram(programId);
      setDepartments(data);
    } catch (err) {
      toast.error("Không thể tải danh sách phòng ban");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (programId, departmentId) => {
    try {
      setLoading(true);
      const data = await filterProjects(programId, departmentId);
      setProjects(data);

      // Flatten interns from projects
      const allInterns = [];
      data.forEach((project) => {
        if (project.internNames && Array.isArray(project.internNames)) {
          project.internNames.forEach((intern) => {
            allInterns.push({
              ...intern,
              projectId: project.id,
              projectTitle: project.title,
              mentorName: project.mentorName,
              mentorId: project.mentorId,
            });
          });
        }
      });

      setInterns(allInterns);
    } catch (err) {
      toast.error("Không thể tải danh sách dự án");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluations = async (internId) => {
    try {
      setLoading(true);
      const data = await getEvaluationsByIntern(internId);
      setEvaluations(data || []);
    } catch (err) {
      console.error("Không thể tải evaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (internId) => {
    try {
      setLoading(true);
      const data = await getReportsByIntern(internId);
      setReports(data || []);
    } catch (err) {
      console.error("Không thể tải báo cáo:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramChange = (e) => {
    setSelectedProgramId(e.target.value);
    setSelectedDepartmentId("");
    setSelectedIntern(null);
    setEvaluations([]);
    setReports([]);
    setShowInternList(true);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartmentId(e.target.value);
    setSelectedIntern(null);
    setEvaluations([]);
    setReports([]);
    setShowInternList(true);
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setShowForm(false);
    setEditingReport(null);
    setShowInternList(false);
  };

  const handleBackToList = () => {
    setShowInternList(true);
    setSelectedIntern(null);
    setEvaluations([]);
    setReports([]);
    setShowForm(false);
    setEditingReport(null);
  };

  const handleCopyInternId = (internId) => {
    navigator.clipboard.writeText(internId.toString());
    setCopiedInternId(internId);
    setTimeout(() => setCopiedInternId(null), 2000);
  };

  const handleNewReport = () => {
    setShowForm(true);
    setEditingReport(null);
    setFormData({
      summary: "",
      recommendations: "",
      overallScore: 0,
    });
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowForm(true);
    setFormData({
      summary: report.summary,
      recommendations: report.recommendations,
      overallScore: report.overallScore,
    });
  };

  const handleSubmitReport = async () => {
    if (!selectedIntern) {
      toast.error("Vui lòng chọn thực tập sinh");
      return;
    }

    if (!formData.summary.trim()) {
      toast.error("Vui lòng nhập tóm tắt đánh giá");
      return;
    }

    if (!formData.recommendations.trim()) {
      toast.error("Vui lòng nhập đề xuất");
      return;
    }

    if (formData.overallScore < 0 || formData.overallScore > 10) {
      toast.error("Điểm tổng quát phải từ 0 đến 10");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        internId: selectedIntern.id,
        summary: formData.summary,
        recommendations: formData.recommendations,
        overallScore: parseFloat(formData.overallScore),
      };

      if (editingReport) {
        await updateReport(editingReport.reportId, payload);
        toast.success("Cập nhật báo cáo thành công!");
      } else {
        await createReport(payload);
        toast.success("Tạo báo cáo thành công!");
      }

      setShowForm(false);
      setEditingReport(null);
      loadReports(selectedIntern.id);
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) return;

    try {
      setLoading(true);
      await deleteReport(reportId);
      toast.success("Xóa báo cáo thành công!");
      loadReports(selectedIntern.id);
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReport(null);
  };

  const getScoreClass = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "poor";
  };

  // Statistics
  const stats = {
    totalInterns: interns.length,
    totalReports: reports.length,
    totalEvaluations: evaluations.length,
    avgScore:
      reports.length > 0
        ? (
            reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length
          ).toFixed(1)
        : 0,
  };

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Báo cáo Cuối kỳ Thực tập sinh</h1>
      </div>

      {/* Statistics */}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">
            <Users />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalInterns}</div>
            <div className="stat-label">Tổng TTS</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">
            <ClipboardList />
          </div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {stats.totalEvaluations}
            </div>
            <div className="stat-label">Đánh giá định kỳ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">
            <FileText />
          </div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">
              {stats.totalReports}
            </div>
            <div className="stat-label">Báo cáo cuối kỳ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-total">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-label">Điểm trung bình</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid-report">
          <div className="form-group">
            <label className="form-label">
              Chương trình <span className="required">*</span>
            </label>
            <select
              value={selectedProgramId}
              onChange={handleProgramChange}
              className="program-select"
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.programName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phòng ban</label>
            <select
              value={selectedDepartmentId}
              onChange={handleDepartmentChange}
              style={{ width: "150px" }}
              className="form-select"
              disabled={loading || !selectedProgramId}
            >
              <option value="">-- Tất cả phòng ban --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interns Grid - CHỈ HIỆN KHI showInternList = true */}
      {!loading && selectedProgramId && showInternList && (
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">
              Danh sách thực tập sinh
              <span className="count-badge">{interns.length}</span>
            </h2>
          </div>

          {interns.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <Users />
              </div>
              <div className="empty-text">Không có thực tập sinh nào</div>
            </div>
          ) : (
            <div className="interns-grid">
              {interns.map((intern) => (
                <div
                  key={`${intern.id}-${intern.projectId}`}
                  className="intern-card"
                  onClick={() => handleSelectIntern(intern)}
                >
                  <div className="intern-header">
                    <div>
                      <h3 className="intern-name">{intern.fullName}</h3>
                      <div className="intern-id">
                        <span>ID: {intern.id}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyInternId(intern.id);
                          }}
                          className={`copy-btn ${
                            copiedInternId === intern.id ? "copied" : ""
                          }`}
                          title="Copy ID"
                        >
                          {copiedInternId === intern.id ? <Check /> : <Copy />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="intern-info">
                    <div className="info-row">
                      <BookOpen style={{ color: "#667eea" }} />
                      <div>
                        <span className="info-label">Dự án</span>
                        <span className="info-value">
                          {intern.projectTitle}
                        </span>
                      </div>
                    </div>
                    <div className="info-row">
                      <Star style={{ color: "#f59e0b" }} />
                      <div>
                        <span className="info-label">Mentor</span>
                        <span className="info-value">
                          {intern.mentorName || "Chưa có"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Section - CHỈ HIỆN KHI ĐÃ CHỌN INTERN VÀ showInternList = false */}
      {selectedIntern && !showInternList && (
        <div className="card">
          <div className="evaluation-header">
            <div className="evaluation-title-group">
              <div className="evaluation-icon">
                <FileText />
              </div>
              <div className="evaluation-title-text">
                <h2>{selectedIntern.fullName}</h2>
                <p>Đánh giá và báo cáo tổng kết</p>
              </div>
            </div>
            <button onClick={handleBackToList} className="btn btn-outline">
              <ArrowLeft />
              Quay lại danh sách
            </button>
          </div>

          {/* Evaluations */}
          <div className="evaluations-reference">
            <h3 className="history-title">
              <ClipboardList />
              Đánh giá định kỳ từ Mentor
              <span className="info-badge">Tham khảo</span>
            </h3>

            {evaluations.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <ClipboardList />
                </div>
                <div className="empty-text">Chưa có đánh giá định kỳ</div>
              </div>
            ) : (
              <div className="history-list">
                {evaluations.map((evaluation) => (
                  <div
                    key={evaluation.evaluationId}
                    className="history-item reference"
                  >
                    <div className="history-header">
                      <div>
                        <div className="history-meta">
                          <span className="cycle-badge">
                            {evaluation.cycle}
                          </span>
                          <span className="period-text">
                            Kỳ {evaluation.periodNo}
                          </span>
                        </div>
                        <p className="history-date">
                          {new Date(evaluation.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>

                    {evaluation.comment && (
                      <p className="history-comment">"{evaluation.comment}"</p>
                    )}

                    <div className="scores-list">
                      {evaluation.scores.map((score, idx) => (
                        <div key={idx} className="score-item">
                          <div className="score-content">
                            <span className="score-name">
                              {score.criteriaName}
                            </span>
                            {score.comment && (
                              <p className="score-comment">{score.comment}</p>
                            )}
                          </div>
                          <span
                            className={`score-value ${getScoreClass(
                              score.score
                            )}`}
                          >
                            {score.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Report Section */}
          <div className="final-report-section">
            <div className="evaluation-header">
              <h3 className="history-title">
                <FileText />
                Báo cáo cuối kỳ của HR
              </h3>

              {!showForm && (
                <button onClick={handleNewReport} className="btn btn-primary">
                  <Plus />
                  Tạo báo cáo cuối kỳ
                </button>
              )}
            </div>

            {/* Report Form */}
            {showForm && (
              <div className="evaluation-form">
                <h3 className="form-title">
                  <Edit />
                  {editingReport ? "Chỉnh sửa báo cáo" : "Tạo báo cáo cuối kỳ"}
                </h3>

                <div className="form-group">
                  <label className="form-label">
                    Điểm tổng quát <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.overallScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overallScore: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="Nhập điểm từ 0 đến 10"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tóm tắt đánh giá <span className="required">*</span>
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="form-textarea"
                    rows="6"
                    placeholder="Nhập tóm tắt về kỹ năng, thái độ làm việc..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Đề xuất <span className="required">*</span>
                  </label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendations: e.target.value,
                      })
                    }
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập đề xuất về tuyển dụng, đào tạo thêm..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={loading}
                    className="btn btn-success"
                  >
                    <Save />
                    {editingReport ? "Cập nhật báo cáo" : "Lưu báo cáo"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="btn btn-outline"
                  >
                    <X />
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Report History */}
            {!showForm && reports.length === 0 && (
              <div className="empty">
                <div className="empty-icon">
                  <FileText />
                </div>
                <div className="empty-text">Chưa có báo cáo cuối kỳ</div>
              </div>
            )}

            {!showForm && reports.length > 0 && (
              <div className="history-list">
                {reports.map((report) => (
                  <div key={report.reportId} className="history-item final">
                    <div className="history-header">
                      <div>
                        <div className="report-meta">
                          <span
                            className={`score-badge ${getScoreClass(
                              report.overallScore
                            )}`}
                          >
                            <TrendingUp size={16} />
                            Điểm: {report.overallScore}
                          </span>
                          <span className="hr-name">
                            Người đánh giá: {report.hrName}
                          </span>
                        </div>
                        <p className="history-date">
                          {new Date(report.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="history-actions">
                        <button
                          onClick={() => handleEditReport(report)}
                          className="btn-icon edit"
                          title="Chỉnh sửa"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.reportId)}
                          className="btn-icon delete"
                          title="Xóa"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>

                    <div className="report-section">
                      <h4 className="section-label">
                        <MessageSquare size={16} />
                        Tóm tắt đánh giá:
                      </h4>
                      <p className="report-content">{report.summary}</p>
                    </div>

                    <div className="report-section">
                      <h4 className="section-label">
                        <Award size={16} />
                        Đề xuất:
                      </h4>
                      <p className="report-content">{report.recommendations}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card">
          <div className="loading center">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
    </div>
  );
}
