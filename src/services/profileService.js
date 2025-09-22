// src/services/profileService.js
// 🔧 MOCK: trả Promise.resolve để xem UI ngay
export async function getMyProfile() {
  await delay(300);
  return {
    fullName: "Intern One",
    email: "intern1@company.com",
    university: "HCMUT",
    major: "Software Engineering",
    mentorName: "Mentor One",
    startDate: "2025-03-01",
    endDate: "2025-06-30",
  };
}

export async function getMyDocuments() {
  await delay(300);
  return [
    {
      id: 1,
      type: "CV",
      fileName: "CV_InternOne.pdf",
      uploadedAt: "2025-03-02",
      status: "APPROVED",
      note: "OK",
      url: "#",
    },
    {
      id: 2,
      type: "APPLICATION",
      fileName: "Application.pdf",
      uploadedAt: "2025-03-03",
      status: "PENDING",
      note: null,
    },
    {
      id: 3,
      type: "CONTRACT",
      fileName: "InternshipContract.pdf",
      uploadedAt: "2025-03-05",
      status: "REJECTED",
      note: "Thiếu chữ ký",
    },
  ];
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
