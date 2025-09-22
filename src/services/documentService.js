import api from "./apiClient";

const MOCK = true;

// bộ nhớ tạm cho mock
let _docs = [
  {
    id: 1,
    type: "CV",
    fileName: "CV_InternOne.pdf",
    uploadedAt: "2025-03-02",
    status: "APPROVED",
    note: "OK",
    ownerId: 4,
  },
  {
    id: 2,
    type: "APPLICATION",
    fileName: "Application.pdf",
    uploadedAt: "2025-03-03",
    status: "PENDING",
    note: null,
    ownerId: 4,
  },
];

// Intern: lấy tài liệu của chính mình
export async function getMyDocs() {
  if (MOCK) return _docs.filter((d) => d.ownerId === 4); // giả: intern id = 4
  const { data } = await api.get("/intern/me/documents");
  return data;
}

// Intern: upload tài liệu
export async function uploadMyDoc({ type, file }) {
  if (MOCK) {
    const id = Math.max(0, ..._docs.map((d) => d.id)) + 1;
    _docs.push({
      id,
      type,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      status: "PENDING",
      note: null,
      ownerId: 4,
    });
    return { success: true };
  }
  const form = new FormData();
  form.append("type", type);
  form.append("file", file);
  const { data } = await api.post("/intern/me/documents", form);
  return data;
}

// HR: hàng chờ duyệt
export async function getPendingDocs() {
  if (MOCK) return _docs.filter((d) => d.status === "PENDING");
  const { data } = await api.get("/hr/documents?status=PENDING");
  return data;
}

// HR: duyệt / từ chối
export async function reviewDoc(id, action, note) {
  if (MOCK) {
    _docs = _docs.map((d) =>
      d.id === id
        ? {
            ...d,
            status: action === "APPROVE" ? "APPROVED" : "REJECTED",
            note: note || d.note,
          }
        : d
    );
    return { success: true };
  }
  const { data } = await api.post(`/hr/documents/${id}/review`, {
    action,
    note,
  });
  return data;
}
