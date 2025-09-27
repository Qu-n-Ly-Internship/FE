// src/services/profileService.js
// TODO(stagewise): Replace mock data with real API calls
export async function getMyProfile(user) {
  await delay(300);
  
  // Return profile data based on current user
  const profileData = {
    fullName: user?.fullName || "Unknown User",
    email: user?.email || "unknown@example.com",
    role: user?.role || "INTERN",
  };
  
  // Add role-specific data
  if (user?.role === "USER") {
    return {
      ...profileData,
      status: "Ứng viên",
      appliedDate: "2025-01-15", // TODO(stagewise): Get from user data
      university: "HCMUT", // TODO(stagewise): Get from user data
      major: "Software Engineering", // TODO(stagewise): Get from user data
      expectedStartDate: "2025-03-01", // TODO(stagewise): Get from user data
    };
  } else if (user?.role === "INTERN") {
    return {
      ...profileData,
      status: "Thực tập sinh",
      university: "HCMUT", // TODO(stagewise): Get from user data
      major: "Software Engineering", // TODO(stagewise): Get from user data
      mentorName: "Mentor One", // TODO(stagewise): Get from user data
      startDate: "2025-03-01", // TODO(stagewise): Get from user data
      endDate: "2025-06-30", // TODO(stagewise): Get from user data
    };
  } else if (user?.role === "HR") {
    return {
      ...profileData,
      department: "Human Resources",
      joinDate: "2023-01-15",
      position: "HR Manager",
    };
  } else if (user?.role === "ADMIN") {
    return {
      ...profileData,
      department: "IT Administration",
      joinDate: "2022-06-01",
      position: "System Administrator",
      permissions: "Full Access",
    };
  } else {
    return profileData;
  }
}

export async function getMyDocuments(user) {
  await delay(300);
  
  // TODO(stagewise): Replace with real API call based on user ID
  // Return documents specific to the user
  if (user?.role === "USER") {
    return [
      {
        id: 1,
        type: "CV",
        fileName: `CV_${user.fullName?.replace(" ", "_")}.pdf`,
        uploadedAt: "2025-01-15",
        status: "PENDING",
        note: "Đang chờ HR xem xét",
        url: "#",
      },
    ];
  } else if (user?.role === "INTERN") {
    return [
      {
        id: 1,
        type: "CV",
        fileName: `CV_${user.fullName?.replace(" ", "_")}.pdf`,
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
        status: "APPROVED",
        note: "Đã duyệt",
        url: "#",
      },
      {
        id: 3,
        type: "CONTRACT",
        fileName: "Contract.pdf",
        uploadedAt: "2025-03-05",
        status: "PENDING",
        note: "Chờ ký hợp đồng",
        url: "#",
      },
    ];
  } else {
    // HR/ADMIN users might not have documents or have different types
    return [];
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
