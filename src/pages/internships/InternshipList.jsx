import { useState, useEffect } from "react";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setInternships([
        {
          id: 1,
          title: "Frontend Developer Intern",
          company: "Tech Corp",
          student: "Nguyễn Văn A",
          status: "active",
          startDate: "2024-01-15",
          endDate: "2024-06-15"
        },
        {
          id: 2,
          title: "Backend Developer Intern",
          company: "Software Solutions",
          student: "Trần Thị B",
          status: "completed",
          startDate: "2023-09-01",
          endDate: "2024-02-01"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center" }}>Đang tải...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Danh sách Thực tập</h1>
        <button style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Thêm thực tập mới
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Vị trí</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Công ty</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Sinh viên</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Trạng thái</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Thời gian</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{internship.title}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{internship.company}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{internship.student}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: internship.status === "active" ? "#d4edda" : "#f8d7da",
                    color: internship.status === "active" ? "#155724" : "#721c24"
                  }}>
                    {internship.status === "active" ? "Đang thực tập" : "Hoàn thành"}
                  </span>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  {internship.startDate} - {internship.endDate}
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <button style={{
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginRight: "8px"
                  }}>
                    Xem
                  </button>
                  <button style={{
                    background: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
