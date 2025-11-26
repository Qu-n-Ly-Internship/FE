import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả lịch họp
 */
export const getMeetings = async () => {
  try {
    const response = await apiClient.get("/meetings");
    return response.data;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một lịch họp theo ID
 */
export const getMeetingById = async (meetingId) => {
  try {
    const response = await apiClient.get(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting by ID:", error);
    throw error;
  }
};

/**
 * Tạo lịch họp mới
 * @param {Object} meetingData - Dữ liệu lịch họp
 * @param {string} meetingData.title - Tiêu đề cuộc họp
 * @param {string} meetingData.meetingTime - Thời gian họp (ISO format)
 * @param {string} meetingData.location - Địa điểm
 * @param {string} meetingData.description - Mô tả
 * @param {Array<number>} meetingData.attendeeIds - Danh sách ID thực tập sinh
 */
export const createMeeting = async (meetingData) => {
  try {
    const response = await apiClient.post("/meetings", meetingData);
    return response.data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

/**
 * Cập nhật lịch họp
 * @param {number} meetingId - ID lịch họp
 * @param {Object} meetingData - Dữ liệu cập nhật
 */
export const updateMeeting = async (meetingId, meetingData) => {
  try {
    const response = await apiClient.put(`/meetings/${meetingId}`, meetingData);
    return response.data;
  } catch (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }
};

/**
 * Xóa lịch họp
 * @param {number} meetingId - ID lịch họp
 */
export const deleteMeeting = async (meetingId) => {
  try {
    const response = await apiClient.delete(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting meeting:", error);
    throw error;
  }
};

/**
 * Lấy danh sách lịch họp theo thực tập sinh
 * @param {number} internId - ID thực tập sinh
 */
export const getMeetingsByIntern = async (internId) => {
  try {
    const response = await apiClient.get(`/meetings/intern/${internId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching meetings by intern:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái lịch họp
 * @param {number} meetingId - ID lịch họp
 * @param {string} status - Trạng thái mới (scheduled, completed, cancelled)
 */
export const updateMeetingStatus = async (meetingId, status) => {
  try {
    const response = await apiClient.patch(`/meetings/${meetingId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating meeting status:", error);
    throw error;
  }
};

/**
 * Gửi lại email thông báo cho cuộc họp
 * @param {number} meetingId - ID lịch họp
 */
export const resendMeetingNotification = async (meetingId) => {
  try {
    const response = await apiClient.post(
      `/meetings/${meetingId}/resend-notification`
    );
    return response.data;
  } catch (error) {
    console.error("Error resending meeting notification:", error);
    throw error;
  }
};
