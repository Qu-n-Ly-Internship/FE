// src/pages/internships/ReportIntern.jsx - Chuẩn hóa
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Award,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  ClipboardList,
  User,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  getEvaluationsByUser,
  getReportsByUser,
} from "../../services/reportService";

import "./ReportIntern.css";

export default function InternViewReports() {
  const [evaluations, setEvaluations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);

      // Load cả 2 loại report song song
      const [evalData, reportData] = await Promise.all([
        getEvaluationsByUser(),
        getReportsByUser(),
      ]);

      setEvaluations(evalData || []);
      setReports(reportData || []);

      toast.success("Tải dữ liệu thành công!");
    } catch (err) {
      toast.error("Không thể tải dữ liệu đánh giá!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "poor";
  };

  const calculateAverageScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return (total / scores.length).toFixed(1);
  };

  // Statistics
  const stats = {
    totalEvaluations: evaluations.length,
    totalReports: reports.length,
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

      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Đánh Giá Của Tôi</h1>
        {/* <p>Xem các đánh giá định kỳ và báo cáo cuối kỳ</p> */}
        <button
          onClick={loadAllReports}
          className="btn btn-primary"
          disabled={loading}
        >
          <RefreshCw className={loading ? "spinning" : ""} />
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      {(evaluations.length > 0 || reports.length > 0) && (
        <div className="stats-row">
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
          {reports.length > 0 && (
            <div className="stat-card">
              <div className="stat-icon stat-total">
                <Star />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.avgScore}</div>
                <div className="stat-label">Điểm trung bình</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="loading center">Đang tải dữ liệu...</div>
        </div>
      )}

      {!loading && (
        <>
          {/* Mentor Evaluations Section */}
          <div className="card evaluations-section">
            <div className="section-header">
              <h2 className="section-title">
                <ClipboardList />
                Đánh Giá Định Kỳ Từ Mentor
                <span className="count-badge">{evaluations.length}</span>
              </h2>
            </div>

            {evaluations.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <ClipboardList />
                </div>
                <div className="empty-text">Chưa có đánh giá định kỳ</div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "var(--spacing-sm)",
                  }}
                >
                  Mentor sẽ đánh giá bạn theo từng kỳ
                </p>
              </div>
            ) : (
              <div className="reports-grid">
                {evaluations.map((evaluation) => {
                  const avgScore = calculateAverageScore(evaluation.scores);
                  return (
                    <div
                      key={evaluation.evaluationId}
                      className="report-card evaluation"
                    >
                      <div className="card-header">
                        <div className="header-info">
                          <div className="badges">
                            <span className="cycle-badge">
                              {evaluation.cycle === "weekly"
                                ? "Hàng tuần"
                                : "Hàng tháng"}
                            </span>
                            <span className="period-badge">
                              Kỳ {evaluation.periodNo}
                            </span>
                          </div>
                          <span
                            className={`avg-score ${getScoreClass(avgScore)}`}
                          >
                            <Star size={16} />
                            TB: {avgScore}
                          </span>
                        </div>
                        <p className="card-date">
                          <Calendar size={14} />
                          {new Date(evaluation.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      {evaluation.comment && (
                        <div className="card-comment">
                          <MessageSquare size={16} />
                          <p>{evaluation.comment}</p>
                        </div>
                      )}

                      <div className="scores-grid">
                        {evaluation.scores.map((score, idx) => (
                          <div key={idx} className="score-card">
                            <div className="score-info">
                              <span className="score-name">
                                {score.criteriaName}
                              </span>
                              {score.comment && (
                                <p className="score-comment">{score.comment}</p>
                              )}
                            </div>
                            <span
                              className={`score-badge ${getScoreClass(
                                score.score
                              )}`}
                            >
                              {score.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* HR Final Reports Section */}
          <div className="card final-reports-section">
            <div className="section-header">
              <h2 className="section-title">
                <FileText />
                Báo Cáo Cuối Kỳ Từ HR
                <span className="count-badge">{reports.length}</span>
              </h2>
            </div>

            {reports.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <FileText />
                </div>
                <div className="empty-text">Chưa có báo cáo cuối kỳ</div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "var(--spacing-sm)",
                  }}
                >
                  HR sẽ tạo báo cáo tổng kết cho bạn sau khi kết thúc
                </p>
              </div>
            ) : (
              <div className="reports-grid">
                {reports.map((report) => (
                  <div key={report.reportId} className="report-card final">
                    <div className="card-header">
                      <div className="header-info">
                        <span
                          className={`overall-score ${getScoreClass(
                            report.overallScore
                          )}`}
                        >
                          <TrendingUp size={20} />
                          <span className="score-label">Điểm tổng quát</span>
                          <span className="score-value">
                            {report.overallScore}
                          </span>
                        </span>
                      </div>
                      <div className="card-meta">
                        <p className="hr-info">
                          <User size={14} />
                          {report.hrName}
                        </p>
                        <p className="card-date">
                          <Calendar size={14} />
                          {new Date(report.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="report-body">
                      <div className="report-section">
                        <h4 className="section-label">
                          <MessageSquare size={16} />
                          Tóm tắt đánh giá
                        </h4>
                        <p className="section-content">{report.summary}</p>
                      </div>

                      <div className="report-section">
                        <h4 className="section-label">
                          <Award size={16} />
                          Đề xuất
                        </h4>
                        <p className="section-content recommendations">
                          {report.recommendations}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
