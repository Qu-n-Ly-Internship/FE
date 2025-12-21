import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./MentorAssignmentModal.css";
import {
  assignMentor,
  unassignMentor,
  getInternMentorAssignment,
} from "../../services/mentorService";

export default function MentorAssignmentModal({
  internship,
  mentors,
  loadingMentors,
  onClose,
  onLoadMentors,
}) {
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (internship) {
      loadCurrentAssignment();
      onLoadMentors();
    }
  }, [internship]);

  async function loadCurrentAssignment() {
    const internId = internship?.id || internship?.intern_id;
    console.log("🔍 Loading assignment for internId:", internId);
    if (!internId) {
      setCurrentAssignment(null);
      return;
    }

    setLoadingAssignment(true);
    try {
      const response = await getInternMentorAssignment(internId);
      console.log("📦 Assignment response:", response);

      if (response?.data) {
        const mentorData = {
          mentor: {
            id: response.data.mentorId,
            fullName: response.data.mentorName,
            name: response.data.mentorName,
            email: response.data.mentorEmail,
          },
          assignedAt: response.data.startDate,
        };
        console.log("✅ Found mentor:", mentorData.mentor);
        setCurrentAssignment(mentorData);
        setSelectedMentorId(response.data.mentorId?.toString() || "");
      } else {
        console.log("❌ No mentor found in assignment");
        setCurrentAssignment(null);
      }
    } catch (e) {
      console.error("❌ loadCurrentAssignment error", e);
      setCurrentAssignment(null);
    } finally {
      setLoadingAssignment(false);
    }
  }

  const handleChangeMentor = (e) => {
    setSelectedMentorId(e.target.value);
    setMessage("");
    setError("");
  };

  const onAssignMentor = async () => {
    setMessage("");
    setError("");

    if (!selectedMentorId) {
      setError("Vui lòng chọn mentor");
      return;
    }

    try {
      setAssigning(true);

      const internId = internship.id || internship.intern_id;

      if (!internId) {
        setError("Không tìm thấy ID thực tập sinh");
        return;
      }

      await assignMentor({
        internId: Number(internId),
        mentorId: Number(selectedMentorId),
      });

      setMessage("Đã phân công mentor thành công!");
      await loadCurrentAssignment();
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Phân công mentor thất bại. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  const onUnassignMentor = async () => {
    if (!currentAssignment?.mentor) {
      setError("Thực tập sinh này chưa được phân công mentor");
      return;
    }

    if (!confirm("Bạn có chắc muốn hủy phân công mentor này?")) {
      return;
    }

    try {
      setAssigning(true);
      setMessage("");
      setError("");

      const internId = internship.id || internship.intern_id;
      const mentorId = currentAssignment.mentor.id;
      if (internId && mentorId) {
        await unassignMentor(internId, mentorId);
        setMessage("Đã hủy phân công mentor thành công!");
        setCurrentAssignment(null);
        setSelectedMentorId("");
      }
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Hủy phân công thất bại. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Phân công Mentor cho {internship.student}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Current assignment status */}
          <div className="form-group">
            {loadingAssignment ? (
              <div className="loading-assignment">
                Đang tải thông tin phân công mentor…
              </div>
            ) : currentAssignment?.mentor ? (
              <div className="mentor-status-info">
                <div>
                  <strong>Mentor hiện tại:</strong>{" "}
                  <span className="current-mentor-name">
                    {currentAssignment.mentor.fullName ||
                      currentAssignment.mentor.name}
                  </span>
                  <br />
                  <span className="current-mentor-email">
                    {currentAssignment.mentor.email}
                  </span>
                </div>
                <div className="assigned-date">
                  <strong>Ngày phân công:</strong>{" "}
                  {currentAssignment.assignedAt
                    ? new Date(currentAssignment.assignedAt).toLocaleString()
                    : "-"}
                </div>
                <div className="unassign-action">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={onUnassignMentor}
                    disabled={assigning}
                  >
                    Hủy phân công
                  </button>
                </div>
              </div>
            ) : (
              <div className="mentor-status-info">
                <strong>Trạng thái:</strong> Chưa được phân công mentor
              </div>
            )}
          </div>

          {/* Mentor selection */}
          <div className="form-group">
            <label className="form-label">
              Chọn Mentor <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={selectedMentorId}
              onChange={handleChangeMentor}
              disabled={loadingMentors}
            >
              <option value="">-- Chọn mentor --</option>
              {mentors.map((mentor) => {
                const id = (mentor.id ?? mentor.mentorId)?.toString();
                const name = mentor.fullName || mentor.name || `Mentor ${id}`;
                const email = mentor.email || mentor.username || "";
                return (
                  <option key={id} value={id}>
                    {name} {email ? `• ${email}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAssignMentor}
              disabled={!selectedMentorId || assigning}
            >
              {assigning ? "Đang phân công..." : "Phân công Mentor"}
            </button>
          </div>

          {message && (
            <div className="message-success">
              <span>✅</span>
              {message}
            </div>
          )}
          {error && (
            <div className="message-error">
              <span>❌</span>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

MentorAssignmentModal.propTypes = {
  internship: PropTypes.object.isRequired,
  mentors: PropTypes.array.isRequired,
  loadingMentors: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onLoadMentors: PropTypes.func.isRequired,
};
