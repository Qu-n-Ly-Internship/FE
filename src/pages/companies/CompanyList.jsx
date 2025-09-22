import { useState, useEffect } from "react";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setCompanies([
        {
          id: 1,
          name: "Tech Corp",
          email: "hr@techcorp.com",
          phone: "024-1234-5678",
          address: "123 Đường ABC, Hà Nội",
          industry: "Công nghệ thông tin",
          contactPerson: "Nguyễn Văn X",
          status: "active"
        },
        {
          id: 2,
          name: "Software Solutions",
          email: "contact@softsol.com",
          phone: "028-9876-5432",
          address: "456 Đường XYZ, TP.HCM",
          industry: "Phần mềm",
          contactPerson: "Trần Thị Y",
          status: "active"
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
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Danh sách Công ty</h1>
        <button style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Thêm công ty
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Tên công ty</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Điện thoại</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Lĩnh vực</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Người liên hệ</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Trạng thái</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{company.name}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{company.email}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{company.phone}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{company.industry}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>{company.contactPerson}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: company.status === "active" ? "#d4edda" : "#f8d7da",
                    color: company.status === "active" ? "#155724" : "#721c24"
                  }}>
                    {company.status === "active" ? "Hoạt động" : "Không hoạt động"}
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
