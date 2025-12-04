import React, { useState } from "react";
import axios from "axios";

const AIChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message,
      });

      // Kiểm tra success từ backend
      if (res.data.success === false) {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: res.data.error || "AI gặp lỗi." },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: res.data.answer || "AI không phản hồi.",
          },
        ]);
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Không thể kết nối đến server AI." },
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div className="ai-chat-container">
      <h1 className="ai-title">Tư Vấn Viên</h1>

      <div className="ai-chat-box">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.sender === "user" ? "user" : "ai"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="chat-bubble ai">Đang xử lý...</div>}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Nhập câu hỏi về mua bán hoặc định giá xe..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default AIChatScreen;
