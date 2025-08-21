"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import '@/app/assets/css/boxchatshop.css';

/** Kiểu dữ liệu cơ bản */
type Who = "user" | "seller";
type Message = { id: string; who: Who; html?: string; text?: string; time: string };
type Thread = { id: string; name: string; avatar: string; last: string; messages: Message[] };

export default function ShopChatBox() {
  /** UI state */
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(() => [
    {
      id: "1",
      name: "Shop A",
      avatar: "https://via.placeholder.com/32",
      last: "Hàng còn size M không?",
      messages: [
        { id: "m1", who: "user", text: "Shop còn áo polo trắng size L không?", time: "12:31" },
        { id: "m2", who: "seller", text: "Dạ còn nha bạn, giá 99k ạ", time: "12:32" },
      ],
    },
    {
      id: "2",
      name: "Shop B",
      avatar: "https://via.placeholder.com/32",
      last: "OK bạn nhé",
      messages: [
        { id: "m3", who: "user", text: "Áo khoác denim có freeship không ạ?", time: "09:12" },
        { id: "m4", who: "seller", text: "Đơn từ 200k có freeship bạn nhé!", time: "09:14" },
      ],
    },
  ]);
  const [activeId, setActiveId] = useState<string>("1");
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [activeId, threads]
  );

  /** refs */
  const inputRef = useRef<HTMLInputElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /** auto scroll khi đổi thread / thêm tin */
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeThread]);

  /** helpers */
  const nowHM = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const appendMessage = (msg: Message) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThread.id
          ? t
          : {
              ...t,
              last: msg.text ?? "[media]",
              messages: [...t.messages, msg],
            }
      )
    );
    // scroll xuống cuối
    requestAnimationFrame(() => {
      const el = msgsRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const sendText = () => {
    const val = inputRef.current?.value?.trim();
    if (!val) return;
    // user gửi
    appendMessage({ id: crypto.randomUUID(), who: "user", text: val, time: nowHM() });
    if (inputRef.current) inputRef.current.value = "";

    // demo shop phản hồi
    setTimeout(() => {
      appendMessage({
        id: crypto.randomUUID(),
        who: "seller",
        text: "Shop phản hồi: " + val,
        time: nowHM(),
      });
    }, 500);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      appendMessage({
        id: crypto.randomUUID(),
        who: "user",
        html: `<img src="${url}" style="max-width:150px;border-radius:8px" />`,
        time: nowHM(),
      });
    } else if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      appendMessage({
        id: crypto.randomUUID(),
        who: "user",
        html: `<video src="${url}" controls style="max-width:200px;border-radius:8px"></video>`,
        time: nowHM(),
      });
    } else {
      appendMessage({
        id: crypto.randomUUID(),
        who: "user",
        text: `[File] ${file.name}`,
        time: nowHM(),
      });
    }
    // reset input để chọn lại cùng file vẫn lên
    e.target.value = "";
  };

  return (
    <>
      {/* Nút chat nổi */}
      <button className="chatbox-btn" onClick={() => setOpen(true)}>💬</button>

      {/* Box chat */}
      <div className={`chatbox ${open ? "show" : ""}`} aria-hidden={!open}>
        {/* Sidebar */}
        <div className="chatbox-sidebar">
          <div className="chatbox-sidebar-head">Tin nhắn</div>
          <div className="chatbox-thread-list" id="threadList">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`chatbox-thread ${t.id === activeThread.id ? "active" : ""}`}
                data-thread={t.id}
                onClick={() => setActiveId(t.id)}
              >
                <img src={t.avatar} alt={t.name} />
                <div className="chatbox-thread-info">
                  <div className="chatbox-thread-name">{t.name}</div>
                  <div className="chatbox-thread-last">{t.last}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="chatbox-main">
          <div className="chatbox-head">
            <span className="chatbox-head-name">{activeThread?.name ?? "Shop"}</span>
            <button className="chatbox-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbox-msgs" id="chatMsgs" ref={msgsRef}>
            {activeThread?.messages.map((m) => (
              <div
                key={m.id}
                className={`chatbox-bubble ${m.who === "user" ? "chatbox-user" : "chatbox-seller"}`}
              >
                {m.html ? (
                  <div dangerouslySetInnerHTML={{ __html: m.html }} />
                ) : (
                  <>{m.text}</>
                )}
                <div className="chatbox-meta">{m.time}</div>
              </div>
            ))}
          </div>

          <div className="chatbox-composer">
            <input
              className="chatbox-input"
              ref={inputRef}
              placeholder="Nhập nội dung..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
            />
            <div className="chatbox-tools">
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  if (!inputRef.current) return;
                  inputRef.current.value = (inputRef.current.value || "") + " 🙂";
                  inputRef.current.focus();
                }}
                id="emojiBtn"
              >
                😀
              </button>
              <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>📎</label>
              <input
                ref={fileRef}
                id="fileUpload"
                type="file"
                accept="image/*,video/*"
                onChange={onPickFile}
              />
            </div>
            <button className="chatbox-btn-send" id="sendBtn" onClick={sendText}>➤</button>
          </div>
        </div>
      </div>

      {/* Styles (chuyển nguyên bản từ template, scope global để dùng class cũ) */}
      
    </>
  );
}
