"use client";

import { useEffect, useRef } from "react";
import "@/app/assets/css/boxchat.css";

export default function BoxChatComponent() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wrapperState0Ref = useRef<HTMLDivElement>(null);
  const wrapperState1Ref = useRef<HTMLDivElement>(null);
  const btnStartChatRef = useRef<HTMLDivElement>(null);
  const btnCloseRef = useRef<HTMLButtonElement>(null);
  const chatListRef = useRef<HTMLUListElement>(null);

  const notifCloseBtnRef = useRef<HTMLButtonElement>(null);

  const headerHeight = 133;

  useEffect(() => {
    const wrapper0 = wrapperState0Ref.current;
    const wrapper1 = wrapperState1Ref.current;
    const btnStart = btnStartChatRef.current;
    const btnClose = btnCloseRef.current;
    const notifCloseBtn = notifCloseBtnRef.current; // ✅ NEW
    const addMessage = (
      sender: "user" | "bot",
      text: string,
      showTime = false
    ) => {
      const chatList = chatListRef.current;
      if (!chatList) return;

      const msg = document.createElement("li");
      msg.className = `chat-item ${sender === "user" ? "visitor" : "bot"}`;
      const avatarHTML =
        sender === "bot"
          ? `<div class="avatar-name-msg-item"><div><span class="ant-avatar messages-item-avatar ant-avatar-circle ant-avatar-image" style="width: 32px; height: 32px; line-height: 32px; font-size: 18px"><img src="https://api.oncustomer.canifa.com/user/file/10dbc370-8b4b-11ee-bcfa-1bc0639711b2.png" /></span></div><div class="agent-name">CANIFA</div></div>`
          : "";
      msg.innerHTML = `
    <div class="messages-item-inner">
      ${avatarHTML}
      <div class="message-content-wrapper">
        <div class="message-content has-photo-false">
          <span class="content-item">${text}</span>
        </div>
      </div>
      ${
        showTime
          ? `<div class="message-status"><div class="message-time">${new Date().toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</div></div>`
          : ""
      }
    </div>`;
      chatList.appendChild(msg);
      chatList.scrollTop = chatList.scrollHeight;
    };

    if (wrapper0 && wrapper1 && btnStart && btnClose) {
      wrapper0.style.display = "block";
      wrapper1.style.display = "none";

      btnStart.onclick = async () => {
        wrapper0.style.display = "none";
        wrapper1.style.display = "block";

        // Call API welcome khi mở chat
        try {
          const res = await fetch("http://localhost:3000/chat/welcome");
          // if (!res.ok) throw new Error("Lỗi gọi welcome");
          const data = await res.json();
          const message = data.reply || "Xin chào! Tôi có thể giúp gì cho bạn?";
          addMessage("bot", message, true);
        } catch (err) {
          // console.error("Lỗi khi gọi welcome:", err);
          addMessage("bot", "Xin chào! Tôi có thể giúp gì cho bạn?", true);
        }
      };

      btnClose.onclick = () => {
        wrapper1.style.display = "none";
        wrapper0.style.display = "block";
      };
    }

    if (notifCloseBtn && wrapper0) {
      notifCloseBtn.onclick = () => {
        wrapper0.style.display = "none"; // ✅ Ẩn luôn state-0
      };
    }

    const input = inputRef.current;
    const sendBtn = sendBtnRef.current;
    if (input && sendBtn) {
      const handleInput = () => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
        sendBtn.classList.toggle("hidden", !input.value.trim());
      };
      input.addEventListener("input", handleInput);

      return () => {
        input.removeEventListener("input", handleInput);
      };
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current!;
    const sendBtn = sendBtnRef.current!;
    const emojiBtn = emojiBtnRef.current!;
    const fileInput = fileInputRef.current!;
    const chatList = chatListRef.current!;

    const addMessage = (
      sender: "user" | "bot",
      text: string,
      showTime = false
    ) => {
      const msg = document.createElement("li");
      msg.className = `chat-item ${sender === "user" ? "visitor" : "bot"}`;
      const avatarHTML =
        sender === "bot"
          ? `<div class="avatar-name-msg-item"><div><span class="ant-avatar messages-item-avatar ant-avatar-circle ant-avatar-image" style="width: 32px; height: 32px; line-height: 32px; font-size: 18px"><img src="https://api.oncustomer.canifa.com/user/file/10dbc370-8b4b-11ee-bcfa-1bc0639711b2.png" /></span></div><div class="agent-name">CANIFA</div></div>`
          : "";
      msg.innerHTML = `
        <div class="messages-item-inner">
          ${avatarHTML}
          <div class="message-content-wrapper">
            <div class="message-content has-photo-false">
              <span class="content-item">${text}</span>
            </div>
          </div>
          ${
            showTime
              ? `<div class="message-status"><div class="message-time">${new Date().toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}</div></div>`
              : ""
          }
        </div>`;
      chatList.appendChild(msg);
      chatList.scrollTop = chatList.scrollHeight;
    };

   sendBtn.onclick = async () => {
  const text = input.value.trim();
  const userId = localStorage.getItem("userId");

  if (text) {
    input.value = "";
    input.style.height = "auto";
    sendBtn.classList.add("hidden");

    addMessage("user", text, true);

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          userId: userId, // 👈 gửi userId lên BE
        }),
      });

      if (!response.ok) throw new Error("Lỗi server!");

      const data = await response.json();
      const reply =
        data.reply || "Xin lỗi, hiện tại tôi không hiểu yêu cầu."; // fallback
      addMessage("bot", reply, false);
    } catch (err) {
      console.error("Chat error:", err);
      addMessage("bot", "Xin lỗi, có lỗi xảy ra khi gửi tin nhắn.", false);
    }
  }
};


    emojiBtn.onclick = () => {
      input.value += "😊";
      input.dispatchEvent(new Event("input"));
    };

    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHTML = `<img src="${e.target?.result}" style="max-width: 200px; border-radius: 8px;" alt="${file.name}" />`;
          addMessage("user", imgHTML, true);
        };
        reader.readAsDataURL(file);
      } else {
        addMessage("user", `📎 Đã gửi file: ${file.name}`, true);
      }
    };
  }, []);

  return (
    <div>
      {/* Box chat thu gọn */}
      <div className="chat-wrapper state-0" ref={wrapperState0Ref}>
        <div id="popup" className="popup">
          <span className="show-number">2</span>
          <div style={{ paddingBottom: 8 }}>
            <div className="close-notif"></div>
            <ul className="list-message" style={{ maxHeight: 995 }}></ul>
          </div>
        </div>
        <div
          id="btn-start-chat"
          className="btn-start-chat theme-color-bg-non-hover appear"
          ref={btnStartChatRef}
        >
          <div className="icon show-widget" />
        </div>
      </div>

      {/* Box chat mở rộng */}
      <div className="chat-wrapper state-1" ref={wrapperState1Ref}>
        <div className="btn-start-chat theme-color-bg-non-hover">
          <div className="icon show-widget" />
        </div>
        <div
          className="chat-wrapper-inner"
          style={{
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
            opacity: 1,
            transform: "translateY(0px)",
          }}
        >
          <div className="chat-close-wrapper">
            <button className="chat-close-button" ref={btnCloseRef}>
              <img
                src="https://widget.oncustomer.canifa.com/images/icon-close.svg"
                width={9}
              />
            </button>
          </div>
          <div className="conversation">
            <div className="chat-main-frame">
              <div
                className="chat-header livechat theme-color-bg-non-hover"
                style={{ height: 75 }}
              >
                <div className="widget-header">
                  <div className="main-content-inner minimized">
                    <div className="new-conversation-header">
                      <div className="description-group">
                        <h3 className="title margin-0 title-2">
                          CHAT BOT FIYO
                        </h3>
                        <p className="sub-title">
                          Hãy hỏi bất cứ điều gì hoặc chia sẻ phản hồi của bạn
                          liên quan đến SP &amp; DV của FIYO.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nội dung tin nhắn */}
              <div
                className="chat-content list-conversation under-header-view"
                style={{ height: `calc(100% - ${headerHeight}px)` }}
              >
                <div className="chat-content-inner">
                  <ul className="message-list" ref={chatListRef}></ul>
                </div>
              </div>

              {/* Nhập tin nhắn */}
              <div className="input-box input-status-undefined">
                <div className="place-input">
                  <textarea
                    className="ant-input main-input"
                    placeholder="Nhập tin nhắn"
                    style={{
                      height: "auto",
                      minHeight: 57,
                      maxHeight: 300,
                      overflowY: "auto",
                      resize: "none",
                    }}
                    ref={inputRef}
                  />
                  <div
                    className="composer-button"
                    style={{ alignItems: "center" }}
                  >
                    <span>
                      <div className="ant-upload ant-upload-select ant-upload-select-text">
                        <span className="ant-upload" role="button">
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.mp4,.mkv,.zip"
                            multiple
                            style={{ display: "none" }}
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            className="ant-btn reply-tool-icon no-border"
                          >
                            <img src="https://widget.oncustomer.canifa.com/images/icon-attachment.png" />
                          </button>
                        </span>
                      </div>
                    </span>
                    <button
                      type="button"
                      className="ant-btn reply-tool-icon no-border"
                      ref={emojiBtnRef}
                    >
                      <img src="https://widget.oncustomer.canifa.com/images/icon-emoji.svg" />
                    </button>
                    <button
                      type="button"
                      className="ant-btn reply-tool-icon no-border hidden"
                      style={{ marginLeft: 8 }}
                      ref={sendBtnRef}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/724/724954.png"
                        width={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
              {/* Kết thúc nhập */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
