import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import '../styles/ai.css'

const AIChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Tạo ref để cuộn xuống cuối
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto scroll khi chat hoặc loading thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);

    setMessage(""); // clear input ngay lập tức
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message,
      });

      console.log("AI Response:", res);
      if (res.data.success === false) {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: res.data.error || "AI gặp lỗi." },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: res.data.answer || "AI không phản hồi." },
        ]);
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Không thể kết nối đến server AI." },
      ]);
    }

    setLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Nút Icon Messenger */}
      <button className="chat-icon-button" onClick={toggleChat}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        )}

        {!isOpen && chat.length > 0 && (
          <span className="chat-icon-badge">
            {chat.filter((m) => m.sender === "ai").length}
          </span>
        )}
      </button>

      {/* Chat Container */}
      {isOpen && (
        <div className="ai-chat-container">
          <div className="ai-title">
            <div className="ai-title-text">Tư Vấn Viên</div>
            <button className="close-button" onClick={toggleChat}>-</button>
          </div>

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

            {/* Anchor auto scroll */}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Nhập câu hỏi về mua bán hoặc định giá xe..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatScreen;
