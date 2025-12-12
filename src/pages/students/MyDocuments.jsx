import { useEffect, useState } from "react";
import { getMyDocs } from "../../services/documentService";
import { getMyCVs } from "../../services/cvService";
import { useAuthStore } from "../../store/authStore";
import StatusBadge from "../../components/common/StatusBadge";
import "./MyDocuments.css";

export default function MyDocuments() {
  const { user } = useAuthStore();
  const [cvs, setCvs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      // USER chỉ có CV, INTERN có cả CV và documents
      if (user?.role === "USER") {
        const cvData = await getMyCVs();
        setCvs(cvData);
        setDocuments([]);
      } else {
        const [cvData, docData] = await Promise.all([getMyCVs(), getMyDocs()]);
        setCvs(cvData);
        setDocuments(docData);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="page-container ">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Hồ sơ của tôi</h1>
      </div>

      {/* Error Alert */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* CV Section */}
      <div className="card document-section">
        <h2>📄 CV</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="table-th">Tên file</th>
                <th className="table-th">Loại file</th>
                <th className="table-th">Ngày nộp</th>
                <th className="table-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="loading center">
                    Đang tải…
                  </td>
                </tr>
              )}
              {!loading && cvs.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Chưa có CV nào.
                  </td>
                </tr>
              )}
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td className="table-td">
                    {cv.storagePath ? (
                      <a
                        href={cv.storagePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        {cv.fileName}
                      </a>
                    ) : (
                      cv.fileName
                    )}
                  </td>
                  <td className="table-td">{cv.fileType}</td>
                  <td className="table-td">
                    {cv.uploadedAt
                      ? new Date(cv.uploadedAt).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="table-td">
                    <StatusBadge status={cv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Section - Chỉ hiển thị cho INTERN */}
      {user?.role === "INTERN" && (
        <div className="card document-section">
          <h2>📋 Hợp đồng & Tài liệu</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">Loại tài liệu</th>
                  <th className="table-th">Tên file</th>
                  <th className="table-th">Ngày nộp</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="loading center">
                      Đang tải…
                    </td>
                  </tr>
                )}
                {!loading && documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">
                      Chưa có tài liệu nào.
                    </td>
                  </tr>
                )}
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td className="table-td">{d.type}</td>
                    <td className="table-td">{d.fileName}</td>
                    <td className="table-td">
                      {d.uploadedAt
                        ? new Date(d.uploadedAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="table-td">{d.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
