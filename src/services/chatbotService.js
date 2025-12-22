import { useAuthStore } from "../store/authStore";

const API_URL = "http://codeft.duckdns.org:8000/chat";

export async function sendChatMessage(question, conversationId) {
  const { user } = useAuthStore.getState();

  // Nếu không có user → gửi user_id = null
  const userId = user?.id || null;

  const body = {
    message: question,
     user_id: userId || 0,
     conversation_id: conversationId || undefined
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `API error ${res.status}`);
  }

  return await res.json();
}


