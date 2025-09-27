import { useState, useEffect } from "react";
import "../shared/list.css";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

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
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Danh sách Sinh viên</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>Thêm sinh viên</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">MSSV</th>
              <th className="table-th">Họ tên</th>
              <th className="table-th">Email</th>
              <th className="table-th">Chuyên ngành</th>
              <th className="table-th">Năm học</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="table-td">{student.studentId}</td>
                <td className="table-td">{student.fullName}</td>
                <td className="table-td">{student.email}</td>
                <td className="table-td">{student.major}</td>
                <td className="table-td">Năm {student.year}</td>
                <td className="table-td">
                  <span className={`badge ${student.status === "active" ? "badge-success" : "badge-danger"}`}>
                    {student.status === "active" ? "Đang học" : "Đã tốt nghiệp"}
                  </span>
                </td>
                <td className="table-td">
                  <button className="btn btn-success" style={{ marginRight: 8 }} onClick={() => setViewing(student)}>Xem</button>
                  <button className="btn btn-warning" onClick={() => setEditing(student)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateStudentModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => {
            // tạo id tạm dựa trên thời gian để tránh đụng nhau
            const newItem = {
              id: Date.now(),
              ...data,
            };
            setStudents((prev) => [newItem, ...prev]);
            setShowCreate(false);
          }}
        />
      )}

      {viewing && (
        <ViewStudentModal
          data={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {editing && (
        <EditStudentModal
          data={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CreateStudentModal({ onClose, onCreate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState(1);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    // basic validate
    if (!fullName.trim() || !email.trim() || !studentId.trim()) {
      setErr("Vui lòng nhập Họ tên, Email và MSSV");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErr("Email không hợp lệ");
      return;
    }
    const yr = Number(year);
    if (!Number.isInteger(yr) || yr < 1 || yr > 6) {
      setErr("Năm học phải là số nguyên từ 1 đến 6");
      return;
    }

    onCreate({
      fullName: fullName.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
      major: major.trim(),
      year: yr,
      phone: phone.trim(),
      status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm sinh viên</h2>
        {err && (
          <div style={{ color: "#dc3545", marginBottom: 8, fontSize: 14 }}>{err}</div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="studentId">MSSV</label>
              <input id="studentId" className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ tên</label>
              <input id="fullName" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Điện thoại</label>
              <input id="phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="major">Chuyên ngành</label>
              <input id="major" className="form-input" value={major} onChange={(e) => setMajor(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="year">Năm học</label>
              <input id="year" type="number" min={1} max={6} className="form-input" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="status">Trạng thái</label>
              <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Đang học</option>
                <option value="graduated">Đã tốt nghiệp</option>
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

function ViewStudentModal({ data, onClose }) {
  if (!data) return null;
  const safe = {
    studentId: data?.studentId ?? "-",
    fullName: data?.fullName ?? "-",
    email: data?.email ?? "-",
    phone: data?.phone ?? "-",
    major: data?.major ?? "-",
    year: data?.year ?? "-",
    status: data?.status ?? "-",
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thông tin sinh viên</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MSSV</label>
            <div>{safe.studentId}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Họ tên</label>
            <div>{safe.fullName}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div>{safe.email}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Điện thoại</label>
            <div>{safe.phone}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Chuyên ngành</label>
            <div>{safe.major}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Năm học</label>
            <div>Năm {safe.year}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div>{safe.status === "active" ? "Đang học" : safe.status === "graduated" ? "Đã tốt nghiệp" : safe.status}</div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

function EditStudentModal({ data, onClose, onSave }) {
  const [fullName, setFullName] = useState(data?.fullName ?? "");
  const [email, setEmail] = useState(data?.email ?? "");
  const [studentId, setStudentId] = useState(data?.studentId ?? "");
  const [major, setMajor] = useState(data?.major ?? "");
  const [year, setYear] = useState(data?.year ?? 1);
  const [phone, setPhone] = useState(data?.phone ?? "");
  const [status, setStatus] = useState(data?.status ?? "active");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!fullName.trim() || !email.trim() || !studentId.trim()) {
      setErr("Vui lòng nhập Họ tên, Email và MSSV");
      return;
    }
    const yr = Number.parseInt(year, 10);
    if (!Number.isInteger(yr) || yr < 1 || yr > 6) {
      setErr("Năm học phải là số nguyên từ 1 đến 6");
      return;
    }
    onSave({
      ...(data || {}),
      fullName: fullName.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
      major: major.trim(),
      year: yr,
      phone: phone.trim(),
      status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Sửa thông tin sinh viên</h2>
        {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">MSSV</label>
              <input className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Họ tên</label>
              <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Điện thoại</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Chuyên ngành</label>
              <input className="form-input" value={major} onChange={(e) => setMajor(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Năm học</label>
              <input type="number" min={1} max={6} className="form-input" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Đang học</option>
                <option value="graduated">Đã tốt nghiệp</option>
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
