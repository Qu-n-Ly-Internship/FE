import { useState, useEffect } from "react";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setStudents([
        {
          id: 1,
          fullName: "Nguyễn Văn A",
          email: "nguyenvana@student.edu.vn",
          studentId: "20210001",
          major: "Công nghệ thông tin",
          year: 3,
          phone: "0123456789",
          status: "active"
        },
        {
          id: 2,
          fullName: "Trần Thị B",
          email: "tranthib@student.edu.vn",
          studentId: "20210002",
          major: "Kỹ thuật phần mềm",
          year: 4,
          phone: "0987654321",
          status: "graduated"
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
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Danh sách Sinh viên</h1>
        <button style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Thêm sinh viên
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>MSSV</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Họ tên</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Chuyên ngành</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Năm học</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Trạng thái</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{student.studentId}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{student.fullName}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{student.email}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{student.major}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>Năm {student.year}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: student.status === "active" ? "#d4edda" : "#f8d7da",
                    color: student.status === "active" ? "#155724" : "#721c24"
                  }}>
                    {student.status === "active" ? "Đang học" : "Đã tốt nghiệp"}
                  </span>
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
