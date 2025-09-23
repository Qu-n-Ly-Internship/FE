import { useState, useEffect } from "react";
import "../shared/list.css";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

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
    return <div className="loading center">Đang tải...</div>;
  }

function CreateCompanyModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [status, setStatus] = useState("active");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !email.trim()) {
      setErr("Vui lòng nhập Tên công ty và Email");
      return;
    }
    onCreate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      industry: industry.trim(),
      contactPerson: contactPerson.trim(),
      status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm công ty</h2>
        {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên công ty</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Điện thoại</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Lĩnh vực</label>
              <input className="form-input" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Người liên hệ</label>
              <input className="form-input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Tạo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Danh sách Công ty</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Thêm công ty
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">Tên công ty</th>
              <th className="table-th">Email</th>
              <th className="table-th">Điện thoại</th>
              <th className="table-th">Lĩnh vực</th>
              <th className="table-th">Người liên hệ</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="table-td">{company.name}</td>
                <td className="table-td">{company.email}</td>
                <td className="table-td">{company.phone}</td>
                <td className="table-td">{company.industry}</td>
                <td className="table-td">{company.contactPerson}</td>
                <td className="table-td">
                  <span className={`badge ${company.status === "active" ? "badge-success" : "badge-danger"}`}>
                    {company.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td className="table-td">
                  <button className="btn btn-success" style={{ marginRight: 8 }} onClick={() => setViewing(company)}>Xem</button>
                  <button className="btn btn-warning" onClick={() => setEditing(company)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <CreateCompanyModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => {
            const newItem = { id: Date.now(), ...data };
            setCompanies((prev) => [newItem, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
      {viewing && (
        <ViewCompanyModal data={viewing} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <EditCompanyModal
          data={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ViewCompanyModal({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thông tin công ty</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tên công ty</label>
            <div>{data.name}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div>{data.email}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Điện thoại</label>
            <div>{data.phone}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Lĩnh vực</label>
            <div>{data.industry}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <div>{data.address || "-"}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Người liên hệ</label>
            <div>{data.contactPerson}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div>{data.status === "active" ? "Hoạt động" : "Không hoạt động"}</div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

function EditCompanyModal({ data, onClose, onSave }) {
  const [name, setName] = useState(data.name || "");
  const [email, setEmail] = useState(data.email || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [address, setAddress] = useState(data.address || "");
  const [industry, setIndustry] = useState(data.industry || "");
  const [contactPerson, setContactPerson] = useState(data.contactPerson || "");
  const [status, setStatus] = useState(data.status || "active");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !email.trim()) {
      setErr("Vui lòng nhập Tên công ty và Email");
      return;
    }
    onSave({
      ...data,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      industry: industry.trim(),
      contactPerson: contactPerson.trim(),
      status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Sửa thông tin công ty</h2>
        {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên công ty</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Điện thoại</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Lĩnh vực</label>
              <input className="form-input" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Người liên hệ</label>
              <input className="form-input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
