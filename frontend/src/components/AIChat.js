import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import '../styles/ai.css'

const AIChat = () => {
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

  // Xử lý khi Support Button được mở
  useEffect(() => {
    const handleSupportOpen = () => {
      setIsOpen(false)
    }

    window.addEventListener('support-opened', handleSupportOpen)
    return () => {
      window.removeEventListener('support-opened', handleSupportOpen)
    }
  }, [])

  // Phát sự kiện khi AI Chat được mở
  const toggleChat = () => {
    if (!isOpen) {
      // Sắp mở AI Chat, phát event để đóng Support
      window.dispatchEvent(new CustomEvent('ai-chat-opened'))
    }
    setIsOpen(!isOpen)
  }

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
          {
            sender: "ai",
            text: res.data.answer || "AI không phản hồi.",
            product: res.data.product
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

    setLoading(false);
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
                <div>{msg.text}</div>

                {/* Render Product Card if available */}
                {msg.sender === 'ai' && msg.product && (
                  <div style={{
                    marginTop: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0'
                  }}>
                    {msg.product.image && (
                      <img
                        src={msg.product.image}
                        alt={msg.product.name}
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '10px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                        {msg.product.name}
                      </h4>
                      <div style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(msg.product.price)}
                      </div>
                      <a
                        href={`/product/${msg.product._id}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '6px 0',
                          backgroundColor: '#0F62FE',
                          color: 'white',
                          textAlign: 'center',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Xem chi tiết
                      </a>
                    </div>
                  </div>
                )}
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

export default AIChat;
