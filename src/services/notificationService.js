// src/services/NotificationService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

const NotificationService = {
  /**
   * 📡 Kết nối SSE
   */
  connectSSE(userId, onNotification) {
    const url = `${
      import.meta.env.VITE_API_BASE_URL || "http://codeft.duckdns.org:8090/api"
    }/notifications/stream/${userId}`;

    console.log("🔌 Connecting SSE:", url);
    const eventSource = new EventSource(url);

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 NOTIFICATION RECEIVED:", data);
        onNotification && onNotification(data);
      } catch (err) {
        console.error("❌ SSE parse error:", err);
      }
    });

    eventSource.addEventListener("open", () => {
      console.log("✅ SSE Connected");
    });

    eventSource.onerror = (err) => {
      console.error("❌ SSE Error:", err);
      // EventSource tự động reconnect
    };

    return eventSource;
  },

  /**
   * 📥 Lấy danh sách notifications
   */
  async getNotifications(status = null) {
    const userId = getCurrentUserId();
    const params = status ? { status } : {};
    return api.get(`/notifications/${userId}`, { params });
  },

  /**
   * 🔢 Đếm số unread
   */
  async getUnreadCount() {
    const userId = getCurrentUserId();
    return api.get(`/notifications/${userId}/unread-count`);
  },

  /**
   * ✅ Đánh dấu đã đọc
   */
  async markAsRead(notificationId) {
    return api.put(`/notifications/${notificationId}/read`);
  },

  /**
   * ✅ Đánh dấu tất cả đã đọc
   */
  async markAllAsRead() {
    const userId = getCurrentUserId();
    return api.put(`/notifications/${userId}/read-all`);
  },

  /**
   * 🧪 Test gửi notification
   */
  async sendTest(payload) {
    return api.post(`/notifications/send`, payload);
  },
};

export default NotificationService;