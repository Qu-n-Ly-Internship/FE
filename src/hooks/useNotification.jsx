// src/hooks/useNotification.jsx
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";

export const useNotification = () => {
  const { user } = useAuthStore();
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    // Tránh duplicate connection
    if (eventSourceRef.current) {
      console.log("⚠️ SSE already connected");
      return;
    }

    // Kết nối SSE
    const url = `${
      import.meta.env.VITE_API_BASE_URL || "http://codeft.duckdns.org:8090/api"
    }/notifications/stream/${user.id}`;

    console.log("🔌 Connecting SSE:", url);
    const eventSource = new EventSource(url);

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 NOTIFICATION:", data);

        // Hiển thị toast
        showNotificationToast(data);

      } catch (err) {
        console.error("❌ SSE parse error:", err);
      }
    });

    eventSource.addEventListener("open", () => {
      console.log("✅ SSE Connected");
    });

    eventSource.onerror = (err) => {
      console.error("❌ SSE Error:", err);
    };

    eventSourceRef.current = eventSource;

    // Cleanup
    return () => {
      console.log("🔌 Disconnecting SSE");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user?.id]);
};

// Helper: Hiển thị toast với react-toastify
function showNotificationToast(notification) {
  const getIcon = (type) => {
    switch (type) {
      case "NEW_TASK":
        return "📋";
      case "TASK_UPDATED":
        return "✏️";
      case "TASK_COMPLETED":
        return "✅";
      case "NEW_MESSAGE":
        return "💬";
      case "REMINDER":
        return "⏰";
      default:
        return "🔔";
    }
  };

  const icon = getIcon(notification.type);
  const message = `${icon} ${notification.title}\n${notification.message}`;

  toast.info(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: { whiteSpace: "pre-line" }
  });
}

