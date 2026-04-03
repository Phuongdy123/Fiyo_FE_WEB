'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import '@/app/assets/css/boxchat.css';

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time?: string;
  isImage?: boolean;
}

export default function BoxChatComponent() {
  // --- States ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  // --- Refs ---
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const scrollToBottom = useCallback(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Tự động giãn chiều cao textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    setInputValue(target.value);
  };

  const addMessage = (sender: "user" | "bot", text: string, isImage = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      isImage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newMessage]);

    if (sender === "user") {
      // Bot phản hồi giả lập
      setTimeout(() => {
        addMessage("bot", "Cảm ơn bạn đã nhắn tin cho FIYO! Chúng tôi sẽ phản hồi sớm nhất.");
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage("user", inputValue);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        addMessage("user", event.target?.result as string, true);
      };
      reader.readAsDataURL(file);
    } else {
      addMessage("user", `📎 File: ${file.name}`);
    }
  };

  return (
    <div>
      {/* State 0: Thu gọn */}
      {!isOpen && (
        <div className="chat-wrapper state-0">
          <div className="popup">
            <span className="show-number">{messages.length > 0 ? 1 : 2}</span>
          </div>
          <div className="btn-start-chat theme-color-bg-non-hover appear" onClick={() => setIsOpen(true)}>
            <div className="icon show-widget" />
          </div>
        </div>
      )}

      {/* State 1: Mở rộng */}
      <div className={`chat-wrapper state-1 ${isOpen ? 'active' : 'hidden'}`} 
           style={{ display: isOpen ? 'block' : 'none', opacity: isOpen ? 1 : 0 }}>
        
        <div className="chat-wrapper-inner">
          <div className="chat-close-wrapper">
            <button className="chat-close-button" onClick={() => setIsOpen(false)}>
              <img src="https://widget.oncustomer.canifa.com/images/icon-close.svg" width={9} alt="close" />
            </button>
          </div>

          <div className="conversation">
            <div className="chat-main-frame">
              <div className="chat-header theme-color-bg-non-hover" style={{ height: 75 }}>
                <div className="widget-header">
                  <h3 className="title margin-0 title-2">CHAT BOT FIYO</h3>
                  <p className="sub-title">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              <div className="chat-content list-conversation under-header-view" 
                   ref={chatListRef}
                   style={{ height: '350px', overflowY: 'auto' }}>
                <ul className="message-list">
                  {messages.map((msg) => (
                    <li key={msg.id} className={`chat-item ${msg.sender === "user" ? "visitor" : "bot"}`}>
                      <div className="messages-item-inner">
                        {msg.sender === "bot" && (
                          <div className="avatar-name-msg-item">
                            <span className="ant-avatar messages-item-avatar">
                              <img src="https://api.oncustomer.canifa.com/user/file/10dbc370-8b4b-11ee-bcfa-1bc0639711b2.png" alt="bot" />
                            </span>
                            <div className="agent-name">CANIFA</div>
                          </div>
                        )}
                        <div className="message-content-wrapper">
                          <div className="message-content">
                            {msg.isImage ? (
                              <img src={msg.text} style={{ maxWeight: '200px', borderRadius: 8 }} alt="upload" />
                            ) : (
                              <span className="content-item">{msg.text}</span>
                            )}
                          </div>
                          {msg.sender === "user" && <div className="message-time">{msg.time}</div>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ô nhập liệu */}
              <div className="input-box">
                <div className="place-input">
                  <textarea
                    ref={textareaRef}
                    className="ant-input main-input"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    style={{ resize: "none" }}
                  />
                  <div className="composer-button">
                    <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="reply-tool-icon">
                      <img src="https://widget.oncustomer.canifa.com/images/icon-attachment.png" alt="file" />
                    </button>
                    <button onClick={() => setInputValue(prev => prev + "😊")} className="reply-tool-icon">
                      <img src="https://widget.oncustomer.canifa.com/images/icon-emoji.svg" alt="emoji" />
                    </button>
                    {inputValue.trim() && (
                      <button onClick={handleSend} className="reply-tool-icon">
                        <img src="https://cdn-icons-png.flaticon.com/512/724/724954.png" width={20} alt="send" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}