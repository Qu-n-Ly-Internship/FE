import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả lịch họp
 */
export const getMeetings = async () => {
  const response = await apiClient.get("/meetings");
  return response.data;
};

/**
 * Lấy chi tiết một lịch họp theo ID
 */
export const getMeetingById = async (meetingId) => {
  const response = await apiClient.get(`/meetings/${meetingId}`);
  return response.data;
};

/**
 * Tạo lịch họp mới
 * @param {Object} meetingData - Dữ liệu lịch họp
 * @param {number} meetingData.programId - ID chương trình
 * @param {string} meetingData.title - Tiêu đề cuộc họp
 * @param {string} meetingData.description - Mô tả
 * @param {string} meetingData.startTime - Thời gian bắt đầu (ISO format)
 * @param {string} meetingData.endTime - Thời gian kết thúc (ISO format)
 * @param {string} meetingData.location - Địa điểm
 */
export const createMeeting = async (meetingData) => {
  const response = await apiClient.post("/meetings", meetingData);
  return response.data;
};

/**
 * Cập nhật lịch họp
 * @param {number} meetingId - ID lịch họp
 * @param {Object} meetingData - Dữ liệu cập nhật
 */
export const updateMeeting = async (meetingId, meetingData) => {
  const response = await apiClient.put(`/meetings/${meetingId}`, meetingData);
  return response.data;
};

/**
 * Xóa lịch họp
 * @param {number} meetingId - ID lịch họp
 */
export const deleteMeeting = async (meetingId) => {
  await apiClient.delete(`/meetings/${meetingId}`);
  return { success: true };
};
