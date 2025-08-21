"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Who = "user" | "seller";
type Kind = "text" | "image" | "video" | "file";

type Thread = {
  id: string;
  name: string;
  avatar: string;
  last: string;
};

type BaseMsg = { id: string; who: Who; time: string; kind: Kind };
type TextMsg = BaseMsg & { kind: "text"; text: string };
type ImageMsg = BaseMsg & { kind: "image"; src: string };
type VideoMsg = BaseMsg & { kind: "video"; src: string };
type FileMsg = BaseMsg & { kind: "file"; name: string };
type Message = TextMsg | ImageMsg | VideoMsg | FileMsg;

export default function ChatboxMessenger() {
  // mở/đóng hộp chat
  const [open, setOpen] = useState(true);

  // danh sách thread
  const [threads] = useState<Thread[]>([
    {
      id: "1",
      name: "Shop A",
      avatar: "https://via.placeholder.com/32",
      last: "Hàng còn size M không?",
    },
    {
      id: "2",
      name: "Shop B",
      avatar: "https://via.placeholder.com/32",
      last: "OK bạn nhé",
    },
  ]);
  const [activeThreadId, setActiveThreadId] = useState("1");

  // messages theo từng thread
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({
    "1": [
      mkText("user", "Shop còn áo polo trắng size L không?", "12:31"),
      mkText("seller", "Dạ còn nha bạn, giá 99k ạ", "12:32"),
    ],
    "2": [mkText("seller", "OK bạn nhé", "12:29")],
  });

  const messages = useMemo(() => messagesByThread[activeThreadId] ?? [], [messagesByThread, activeThreadId]);
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId), [threads, activeThreadId]);

  // input + refs
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // auto scroll khi có tin mới / đổi thread / mở hộp chat
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, activeThreadId]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const now = timeNow();
    const msg = mkText("user", text, now);
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), msg],
    }));
    setInput("");
  }

  function handleEmoji() {
    setInput((s) => (s ? s + " 🙂" : "🙂"));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const now = timeNow();

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const msg: ImageMsg = { id: rid(), who: "user", kind: "image", src: url, time: now };
      setMessagesByThread((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), msg],
      }));
    } else if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      const msg: VideoMsg = { id: rid(), who: "user", kind: "video", src: url, time: now };
      setMessagesByThread((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), msg],
      }));
    } else {
      const msg: FileMsg = { id: rid(), who: "user", kind: "file", name: file.name, time: now };
      setMessagesByThread((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), msg],
      }));
    }
    // cho phép chọn cùng file lại
    e.target.value = "";
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
  }

  return (
    <>
      {/* Nút chat nổi */}
      <button
        className="chatbox-messenger-btn"
        aria-label="Mở chat"
        onClick={() => setOpen((o) => !o)}
        title={open ? "Đóng chat" : "Mở chat"}
      >
        💬
      </button>

      {/* Box chat */}
      <div className={`chatbox-messenger ${open ? "show" : ""}`} role="dialog" aria-modal>
        {/* Sidebar */}
        <div className="chatbox-messenger-sidebar">
          <div className="chatbox-messenger-sidebar-head">Tin nhắn</div>
          <div className="chatbox-messenger-thread-list">
            {threads.map((t) => (
              <button
                key={t.id}
                className={"chatbox-messenger-thread " + (t.id === activeThreadId ? "active" : "")}
                onClick={() => switchThread(t.id)}
              >
                <img src={t.avatar} alt={t.name} />
                <div className="chatbox-messenger-thread-info">
                  <div className="chatbox-messenger-thread-name">{t.name}</div>
                  <div className="chatbox-messenger-thread-last">{t.last}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="chatbox-messenger-main">
          <div className="chatbox-messenger-head">
            <span className="chatbox-messenger-head-name">{activeThread?.name ?? "Thời Trang Uniex"}</span>
            <button className="chatbox-messenger-close" aria-label="Đóng chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbox-messenger-msgs">
            {messages.map((m) => (
              <div key={m.id} className={`chatbox-messenger-bubble chatbox-messenger-${m.who}`}>
                {m.kind === "text" && <div>{m.text}</div>}
                {m.kind === "image" && (
                  <img src={m.src} alt="Ảnh gửi" style={{ maxWidth: 180, borderRadius: 8 }} />
                )}
                {m.kind === "video" && (
                  <video src={m.src} controls style={{ maxWidth: 220, borderRadius: 8 }} />
                )}
                {m.kind === "file" && <div>[File] {m.name}</div>}
                <div className="chatbox-messenger-meta">{m.time}</div>
              </div>
            ))}
            <div ref={msgsEndRef} />
          </div>

          <div className="chatbox-messenger-composer">
            <input
              className="chatbox-messenger-input"
              placeholder="Nhập nội dung..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="chatbox-messenger-tools">
              <button type="button" aria-label="Chèn emoji" onClick={handleEmoji} className="ghost">
                🙂 
              </button>
              <label htmlFor="fileUpload" className="ghost" title="Đính kèm">
                📎
              </label>
              <input
                id="fileUpload"
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            <button className="chatbox-messenger-btn-send" onClick={handleSend} aria-label="Gửi" title="Gửi">
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        :global(body) {
          margin: 0;
          font: 14px/1.4 system-ui, sans-serif;
          background: #f3f4f6;
        }

        /* Nút nổi */
        .chatbox-messenger-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #444;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .chatbox-messenger-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }
        .chatbox-messenger-btn:active {
          transform: translateY(0);
        }

        /* Box chat */
        .chatbox-messenger {
          position: fixed;
          bottom: 90px;
          right: 20px;
          z-index: 999;
          width: 640px;
          height: 480px;
          display: none;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
          color: #333;
          transform-origin: bottom right;
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .chatbox-messenger.show {
          display: flex;
          opacity: 1;
          transform: scale(1);
        }

        /* Sidebar */
        .chatbox-messenger-sidebar {
          width: 220px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .chatbox-messenger-sidebar-head {
          padding: 10px 14px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #444;
        }
        .chatbox-messenger-thread-list {
          flex: 1;
          overflow: auto;
        }
        .chatbox-messenger-thread {
          width: 100%;
          text-align: left;
          background: #fff;
          border: none;
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s ease;
        }
        .chatbox-messenger-thread:hover {
          background: #fafafa;
        }
        .chatbox-messenger-thread.active {
          background: #f0f0f0;
        }
        .chatbox-messenger-thread img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .chatbox-messenger-thread-info {
          flex: 1;
        }
        .chatbox-messenger-thread-name {
          font-weight: 600;
          font-size: 13px;
          color: #333;
        }
        .chatbox-messenger-thread-last {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Main chat */
        .chatbox-messenger-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .chatbox-messenger-head {
          padding: 10px 14px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #444;
          font-weight: 600;
          background: #fff;
        }
        .chatbox-messenger-close {
          background: none;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          color: #666;
          padding: 4px 8px;
          transition: background 0.15s ease;
        }
        .chatbox-messenger-close:hover {
          background: #f6f6f6;
        }

        .chatbox-messenger-msgs {
          flex: 1;
          overflow: auto;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fafafa;
        }
        .chatbox-messenger-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 12px;
          line-height: 1.35;
          word-break: break-word;
          animation: fadeIn 0.18s ease;
          border: 1px solid #ddd;
        }
        .chatbox-messenger-user {
          align-self: flex-start;
          background: #fff;
          color: #333;
        }
        .chatbox-messenger-seller {
          align-self: flex-end;
          background: #f7f7f7;
          color: #333;
        }
        .chatbox-messenger-meta {
          font-size: 11px;
          color: #888;
          margin-top: 4px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Composer */
        .chatbox-messenger-composer {
          border-top: 1px solid #e5e7eb;
          padding: 10px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chatbox-messenger-input {
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 8px;
          font: inherit;
          color: #333;
        }
        .chatbox-messenger-tools {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #555;
          font-size: 18px;
        }
        .ghost {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: background 0.15s ease;
        }
        .ghost:hover { background: #f3f4f6; }

        .chatbox-messenger-btn-send {
          background: #fff;
          color: #444;
          border: 1px solid #444;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .chatbox-messenger-btn-send:hover { background: #f3f3f3; }
        .chatbox-messenger-btn-send:active { transform: scale(0.98); }

        @media (max-width: 700px) {
          .chatbox-messenger {
            right: 10px;
            width: calc(100vw - 20px);
            height: 70vh;
          }
          .chatbox-messenger-sidebar { display: none; }
        }
      `}</style>
    </>
  );
}

/* --------- helpers --------- */
function rid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
function timeNow() {
  try {
    return new Date().toLocaleTimeString();
  } catch {
    return "now";
  }
}
function mkText(who: Who, text: string, time: string): TextMsg {
  return { id: rid(), who, kind: "text", text, time };
}
