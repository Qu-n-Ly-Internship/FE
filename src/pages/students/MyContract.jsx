import { useEffect, useState } from "react";
import {
  getDocUrlsByIntern,
  acceptDocument,
} from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyContract.css";

export default function MyContract() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const user = useAuthStore((state) => state.user);
  const internId = user?.internId || user?.id;

  const load = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      if (!internId) {
        console.log("❌ Không tìm thấy ID thực tập sinh");
        return;
      }

      const res = await getDocUrlsByIntern(internId);

      let contractData = null;

      if (Array.isArray(res)) {
        contractData = res[0] || null;
        console.log("📄 Extracted from array:", contractData);
      } else if (res && typeof res === "object") {
        contractData = res.data || res.contract || res;
        console.log("📄 Extracted from object:", contractData);
      }

      console.log("📄 Final contract data:", contractData);
      setContract(contractData);

      if (!contractData) {
        setNotFound(true);
        console.log("ℹ️ Intern chưa có hợp đồng (200 - empty data)");
      }
    } catch (e) {
      console.error("❌ Lỗi tải hợp đồng:", e);
      console.error("❌ Error response:", e?.response);

      if (e?.response?.status === 404) {
        setNotFound(true);
        console.log("ℹ️ Intern chưa có hợp đồng (404)");
        return;
      }

      setNotFound(true);
      console.error(
        "❌ Lỗi khi tải hợp đồng:",
        e?.response?.status || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 User data:", user);
    console.log("🔍 Intern ID:", internId);
    if (internId) load();
  }, [internId]);

  const handleConfirmContract = async () => {
    const documentId =
      contract?.document_id || contract?.id || contract?.documentId;

    if (!documentId) {
      toast.error("Không tìm thấy mã hợp đồng để xác nhận.");
      console.log("❌ Contract object:", contract);
      return;
    }

    try {
      setConfirming(true);

      const result = await acceptDocument(documentId, user.id);
      console.log("✅ API response:", result);

      toast.success("✅ Hợp đồng đã được xác nhận thành công.");

      setContract((prev) => ({
        ...prev,
        status: "ACCEPTED",
      }));
    } catch (e) {
      console.error("❌ Accept error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e.message ||
        "❌ Xác nhận thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="page-container ">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Hợp đồng của tôi</h1>
      </div>

      <div className="card">
        {loading && <div className="loading center">Đang tải dữ liệu…</div>}

        {/* Not Found State */}
        {!loading && notFound && (
          <div className="contract-empty">
            <div className="contract-empty-icon">📄</div>
            <h3>Thực tập sinh chưa có hợp đồng thực tập</h3>
            <p>Vui lòng liên hệ với phòng nhân sự để được hỗ trợ.</p>
            <button className="btn btn-primary" onClick={load}>
              🔄 Kiểm tra lại
            </button>
          </div>
        )}

        {/* No Contract State */}
        {!loading && !contract && !notFound && (
          <div className="empty">⚠️ Không tìm thấy hợp đồng.</div>
        )}

        {/* Contract Details */}
        {!loading && contract && (
          <>
            <div className="contract-info">
              <div className="contract-row">
                <div className="contract-label">Người phụ trách:</div>
                <div className="contract-value">
                  {contract.name_hr ||
                    contract.hr_name ||
                    contract.hrName ||
                    "Không rõ"}
                </div>
              </div>

              <div className="contract-row">
                <div className="contract-label">Trạng thái:</div>
                <div className="contract-value">
                  <span
                    className={`status-badge ${
                      contract.status === "ACCEPTED"
                        ? "status-approved"
                        : "status-pending"
                    }`}
                  >
                    {contract.status
                      ? contract.status.toUpperCase()
                      : "Không rõ"}
                  </span>
                </div>
              </div>

              <div className="contract-row">
                <div className="contract-label">Ngày tải:</div>
                <div className="contract-value">
                  {contract.uploaded_at || contract.uploadedAt
                    ? new Date(
                        contract.uploaded_at || contract.uploadedAt
                      ).toLocaleString("vi-VN")
                    : "-"}
                </div>
              </div>

              <div className="contract-row">
                <div className="contract-label">File hợp đồng:</div>
                <div className="contract-value">
                  {contract.file_url || contract.fileUrl ? (
                    <a
                      href={contract.file_url || contract.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="contract-link"
                    >
                      📄 Xem hợp đồng
                    </a>
                  ) : (
                    "Không có file"
                  )}
                </div>
              </div>
            </div>

            <div className="contract-actions">
              {contract.status === "ACCEPTED" ? (
                <button className="btn btn-success" disabled>
                  ✅ Đã xác nhận
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  disabled={confirming}
                  onClick={handleConfirmContract}
                >
                  {confirming ? "Đang xác nhận…" : "Xác nhận hợp đồng"}
                </button>
              )}

              <button className="btn btn-outline" onClick={load}>
                🔄 Làm mới
              </button>
            </div>
          </>
        )}
      </div>


    </div>
  );
}
