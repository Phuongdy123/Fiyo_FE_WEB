"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserChat } from "./UserChatProvider";

type Who = "user" | "seller";
type Kind = "text" | "image" | "video" | "file";

type Thread = { id: string; name: string; avatar: string; last: string };
type BaseMsg = { id: string; who: Who; time: string; kind: Kind };
type TextMsg = BaseMsg & { kind: "text"; text: string };
type ImageMsg = BaseMsg & { kind: "image"; src: string };
type VideoMsg = BaseMsg & { kind: "video"; src: string };
type FileMsg = BaseMsg & { kind: "file"; name: string };
type Message = TextMsg | ImageMsg | VideoMsg | FileMsg;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

// helpers
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

export default function UserChatDock({
  currentUserId,
  pollMs = 3000,
}: {
  currentUserId: string;
  pollMs?: number;
}) {
  const { open, setOpen, threadId } = useUserChat();

  // sidebar threads
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");

  // messages cache theo thread
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});

  // composer
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // handle scroll
  const messages = useMemo(
    () => messagesByThread[activeThreadId] ?? [],
    [messagesByThread, activeThreadId]
  );
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId]
  );
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, activeThreadId]);

  // khi Provider mở thread mới (openForShop) → set active + add placeholder
  useEffect(() => {
    if (!threadId) return;
    setActiveThreadId(threadId);
    setThreads((prev) => {
      if (prev.some((t) => t.id === threadId)) return prev;
      return [
        {
          id: threadId,
          name: "Đang trò chuyện",
          avatar: "https://via.placeholder.com/32",
          last: "",
        },
        ...prev,
      ];
    });
  }, [threadId]);

  // (tuỳ chọn) fetch danh sách threads theo user để có tên/ảnh shop cho sidebar
  useEffect(() => {
    if (!open || !currentUserId) return;
    let stop = false;

    (async () => {
      try {
        // CẦN BE: GET /api/messeger/threads/user/:userId
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/user/${currentUserId}`,
          { cache: "no-store" }
        );
        if (!res.ok) return; // nếu BE chưa có route này thì ẩn sidebar
        const data = await res.json();

        const arr = Array.isArray(data) ? data : data?.threads || [];
        const mapped: Thread[] = arr.map((t: any) => ({
          id: t._id,
          name: t?.shop?.name || t?.peer_name || "Shop",
          avatar: t?.shop?.avatar || t?.peer_avatar || "https://via.placeholder.com/32",
          last: t?.lastMessage?.text || t?.last || "",
        }));

        if (!stop) setThreads((prev) => {
          // giữ lại active placeholder nếu BE chưa trả item đó
          const ids = new Set(mapped.map((m) => m.id));
          const extra = prev.filter((p) => !ids.has(p.id));
          return [...mapped, ...extra];
        });
      } catch (e) {
        console.error("fetch threads error", e);
      }
    })();

    return () => {
      stop = true;
    };
  }, [open, currentUserId]);

  // poll messages theo threadId (đồng bộ theo ChatWidget)
  useEffect(() => {
    if (!open || !activeThreadId) return;
    let timer: any;
    let error404Count = 0;

    const fetchMsgs = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/${activeThreadId}/messages?page=1&limit=200`,
          { cache: "no-store" }
        );
        if (res.status === 404) {
          error404Count += 1;
          console.warn("messages 404", error404Count);
          if (error404Count >= 3) {
            clearInterval(timer);
            console.warn("Stop polling after 404 x3 — check route prefix");
          }
          return;
        }
        error404Count = 0;

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        const mapped: Message[] = list.map((m: any) => {
          const base: BaseMsg = {
            id: m._id,
            who: m.sender === "seller" ? "seller" : "user",
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString()
              : timeNow(),
            kind: "text",
          };

          // ưu tiên hiển thị attachment nếu có
          if (Array.isArray(m.attachments) && m.attachments.length) {
            const att = m.attachments[0];
            const mime = (att.mimetype || att.type || "").toString();
            if (mime.startsWith("image/")) {
              return { ...base, kind: "image", src: att.url } as ImageMsg;
            }
            if (mime.startsWith("video/")) {
              return { ...base, kind: "video", src: att.url } as VideoMsg;
            }
            return {
              ...base,
              kind: "file",
              name: att.name || "file",
            } as FileMsg;
          }

          return { ...base, kind: "text", text: m.text || "" } as TextMsg;
        });

        setMessagesByThread((prev) => ({
          ...prev,
          [activeThreadId]: mapped,
        }));
      } catch (e) {
        console.error("fetch messages error", e);
      }
    };

    fetchMsgs();
    timer = setInterval(fetchMsgs, pollMs);
    return () => clearInterval(timer);
  }, [open, activeThreadId, pollMs]);

  // gửi text
  async function handleSend() {
    const text = input.trim();
    if (!text || !activeThreadId) return;
    setInput("");

    // append local trước
    const now = timeNow();
    const localMsg = mkText("user", text, now);
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), localMsg],
    }));

    try {
      await fetch(`${API_BASE}/api/messeger/threads/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          text,
        }),
      });
      // poll sẽ tự cập nhật
    } catch (e) {
      console.error("send message error", e);
    }
  }

  function handleEmoji() {
    setInput((s) => (s ? s + " 🙂" : "🙂"));
  }

  // gửi file: upload trước → gửi message với attachments
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeThreadId) return;

    const now = timeNow();
    const url = URL.createObjectURL(file);
    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");

    // hiển thị local
    setMessagesByThread((prev) => {
      const next = [...(prev[activeThreadId] || [])];
      if (isImg) next.push({ id: rid(), who: "user", kind: "image", src: url, time: now } as ImageMsg);
      else if (isVid) next.push({ id: rid(), who: "user", kind: "video", src: url, time: now } as VideoMsg);
      else next.push({ id: rid(), who: "user", kind: "file", name: file.name, time: now } as FileMsg);
      return { ...prev, [activeThreadId]: next };
    });

    try {
      // 1) upload
      const fd = new FormData();
      fd.append("files", file);
      const up = await fetch(`${API_BASE}/api/messeger/upload`, { method: "POST", body: fd });
      const uploaded = await up.json(); // [{ url, name, mimetype, size, type }]
      if (!Array.isArray(uploaded)) return;

      // 2) gửi message có attachments
      await fetch(`${API_BASE}/api/messeger/threads/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          text: "",
          attachments: uploaded,
        }),
      });
    } catch (err) {
      console.error("send file error", err);
    }
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
  }

  return (
    <>
      {/* Nút nổi */}
      <button
        className="chatbox-messenger-btn"
        aria-label="Mở chat"
        onClick={() => setOpen(!open)}
        title={open ? "Đóng chat" : "Mở chat"}
      >
        💬
      </button>

      {/* Box chat */}
      <div className={`chatbox-messenger ${open ? "show" : ""}`} role="dialog" aria-modal>
        {/* Sidebar chỉ hiển thị khi có data */}
        {threads.length > 0 && (
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
        )}

        {/* Main */}
        <div className="chatbox-messenger-main">
          <div className="chatbox-messenger-head">
            <span className="chatbox-messenger-head-name">
              {activeThread?.name ?? "Tin nhắn"}
            </span>
            <button className="chatbox-messenger-close" aria-label="Đóng chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbox-messenger-msgs">
            {(messages ?? []).map((m) => (
              <div key={m.id} className={`chatbox-messenger-bubble chatbox-messenger-${m.who}`}>
                {m.kind === "text" && <div>{(m as TextMsg).text}</div>}
                {m.kind === "image" && (
                  <img
                    src={(m as any).src}
                    alt="Ảnh gửi"
                    style={{ maxWidth: 180, borderRadius: 8 }}
                  />
                )}
                {m.kind === "video" && (
                  <video
                    src={(m as any).src}
                    controls
                    style={{ maxWidth: 220, borderRadius: 8 }}
                  />
                )}
                {m.kind === "file" && <div>[File] {(m as any).name}</div>}
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
            <button
              className="chatbox-messenger-btn-send"
              onClick={handleSend}
              aria-label="Gửi"
              title="Gửi"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Styles: giữ nguyên của bạn */}
      <style jsx>{`
        :global(body){margin:0;font:14px/1.4 system-ui,sans-serif;background:#f3f4f6;}
        .chatbox-messenger-btn{position:fixed;bottom:20px;right:20px;z-index:1000;background:#fff;border:1px solid #ccc;border-radius:50%;width:56px;height:56px;font-size:22px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);color:#444;transition:transform .2s,box-shadow .2s;}
        .chatbox-messenger-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.15);}
        .chatbox-messenger{position:fixed;bottom:90px;right:20px;z-index:999;width:640px;height:480px;display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.16);color:#333;transform-origin:bottom right;opacity:0;transform:scale(.98);transition:opacity .18s,transform .18s;}
        .chatbox-messenger.show{display:flex;opacity:1;transform:scale(1);}
        .chatbox-messenger-sidebar{width:220px;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;background:#fff;}
        .chatbox-messenger-sidebar-head{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#444;}
        .chatbox-messenger-thread-list{flex:1;overflow:auto;}
        .chatbox-messenger-thread{width:100%;text-align:left;background:#fff;border:none;display:flex;gap:8px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;transition:background .15s;}
        .chatbox-messenger-thread:hover{background:#fafafa;}
        .chatbox-messenger-thread.active{background:#f0f0f0;}
        .chatbox-messenger-thread img{width:32px;height:32px;border-radius:50%;}
        .chatbox-messenger-main{flex:1;display:flex;flex-direction:column;background:#fff;}
        .chatbox-messenger-head{padding:10px 14px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;color:#444;font-weight:600;background:#fff;}
        .chatbox-messenger-close{background:none;border:1px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;color:#666;padding:4px 8px;}
        .chatbox-messenger-msgs{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:10px;background:#fafafa;}
        .chatbox-messenger-bubble{max-width:70%;padding:8px 12px;border-radius:12px;line-height:1.35;word-break:break-word;animation:fadeIn .18s;border:1px solid #ddd;}
        .chatbox-messenger-user{align-self:flex-start;background:#fff;color:#333;}
        .chatbox-messenger-seller{align-self:flex-end;background:#f7f7f7;color:#333;}
        .chatbox-messenger-meta{font-size:11px;color:#888;margin-top:4px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .chatbox-messenger-composer{border-top:1px solid #e5e7eb;padding:10px;background:#fff;display:flex;align-items:center;gap:8px;}
        .chatbox-messenger-input{flex:1;border:1px solid #ccc;border-radius:8px;padding:8px;font:inherit;color:#333;}
        .chatbox-messenger-tools{display:flex;gap:10px;align-items:center;color:#555;font-size:18px;}
        .ghost{background:none;border:none;cursor:pointer;padding:4px;border-radius:8px;}
        .chatbox-messenger-btn-send{background:#fff;color:#444;border:1px solid #444;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;}
        @media (max-width:700px){.chatbox-messenger{right:10px;width:calc(100vw - 20px);height:70vh}.chatbox-messenger-sidebar{display:none}}
      `}</style>
    </>
  );
}
