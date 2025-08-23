"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserChat } from "./UserChatProvider";

type Who = "user" | "seller";
type Kind = "text" | "image" | "file";

type Thread = { id: string; name: string; avatar: string; last: string; lastWho?: Who };
type BaseMsg = { id: string; who: Who; time: string; kind: Kind };
type TextMsg = BaseMsg & { kind: "text"; text: string };
type ImageMsg = BaseMsg & { kind: "image"; src: string };
type FileMsg = BaseMsg & { kind: "file"; name: string };
type Message = TextMsg | ImageMsg | FileMsg;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

// ===== helpers =====
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
  pollMs = 5000,
}: {
  currentUserId: string;
  pollMs?: number;
}) {
  const { open, setOpen, threadId, shopInfo } = useUserChat();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");

  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});

  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const msgsEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  const messages = useMemo(
    () => messagesByThread[activeThreadId] ?? [],
    [messagesByThread, activeThreadId]
  );
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId]
  );

  // ========== Khi mở icon chat & chưa có threadId -> tải danh sách threads ==========
  useEffect(() => {
    if (!open) return;
    if (threadId) return; // nếu đã mở thẳng 1 thread (openForShop) thì bỏ qua

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/me/user?user_id=${encodeURIComponent(currentUserId)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // Map về Thread[] cho sidebar
        const mapped: Thread[] = list.map((t: any) => {
          const shop = t?.shop_id || t?.shop || {};
          const last = t?.lastMessage || t?.last || null;

          let lastText = "";
          let lastWho: Who | undefined = undefined;

          if (last) {
            const from = String(last.from || last.sender || "");
            const isSeller = from === "seller";
            // Nếu BE có attachments:
            const hasAtt = Array.isArray(last.attachments) && last.attachments.length > 0;
            const firstAtt = hasAtt ? last.attachments[0] : null;
            const mime = String(firstAtt?.mimetype || firstAtt?.type || "");
            const typ = String(firstAtt?.type || "");
            const isImg = (mime.startsWith("image/") || typ === "image");
            const isFile = hasAtt && !isImg;

            if (isSeller) {
              if (isImg) lastText = "[ảnh]";
              else if (isFile) lastText = "[file]";
              else lastText = last.text || "";
              lastWho = "seller";
            } else {
              lastText = "Đã trả lời";
              lastWho = "user";
            }
          }

          return {
            id: t?._id || t?.thread_id || "",
            name: shop?.name || "Shop",
            avatar: shop?.avatar || "https://via.placeholder.com/32",
            last: lastText,
            lastWho,
          };
        });

        setThreads(mapped);
        // chưa set activeThreadId; user sẽ chọn 1 thread ở sidebar
      } catch (e) {
        console.error("fetch my threads error:", e);
      }
    })();
  }, [open, threadId, currentUserId]);

  // Khi Provider mở thread mới -> add vào sidebar (vẫn giữ behavior cũ)
  useEffect(() => {
    if (!threadId) return;

    setActiveThreadId(threadId);
    setThreads((prev) => {
      const name = shopInfo?.name || "Đang trò chuyện";
      const avatar = shopInfo?.avatar || "https://via.placeholder.com/32";
      const existed = prev.find((t) => t.id === threadId);
      if (existed) return prev.map((t) => (t.id === threadId ? { ...t, name, avatar } : t));
      return [{ id: threadId, name, avatar, last: "", lastWho: undefined }, ...prev];
    });
  }, [threadId, shopInfo]);

  // Auto-scroll chỉ khi có tin mới
  useEffect(() => {
    const nowCount = (messagesByThread[activeThreadId] || []).length;
    prevCountRef.current = nowCount;
  }, [activeThreadId]);

  useEffect(() => {
    const cur = messages.length;
    if (cur > prevCountRef.current) {
      msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = cur;
  }, [messages]);

  // Poll messages thread đang mở
  useEffect(() => {
    if (!open || !activeThreadId) return;
    let timer: any;

    async function fetchMsgs() {
      try {
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/${activeThreadId}/messages?page=1&limit=200`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        const mapped: Message[] = list.map((m: any) => {
          const base: BaseMsg = {
            id: m._id,
            who: m.sender === "seller" ? "seller" : "user",
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : timeNow(),
            kind: "text",
          };
          if (Array.isArray(m.attachments) && m.attachments.length) {
            const att = m.attachments[0];
            const mime = String(att?.mimetype || att?.type || "");
            const typ = String(att?.type || "");
            const url = String(att?.url || "");
            if ((mime.startsWith("image/") || typ === "image") && url) {
              return { ...base, kind: "image", src: url } as ImageMsg;
            }
            return { ...base, kind: "file", name: att?.name || "file" } as FileMsg;
          }
          return { ...base, kind: "text", text: m.text || "" } as TextMsg;
        });

        setMessagesByThread((prev) => ({ ...prev, [activeThreadId]: mapped }));

        // Cập nhật last ở sidebar theo tin cuối
        const last = mapped[mapped.length - 1];
        let lastLabel = "";
        let lastWho: Who | undefined = undefined;
        if (last) {
          if (last.who === "seller") {
            const text =
              last.kind === "text"
                ? (last as TextMsg).text
                : last.kind === "image"
                ? "[ảnh]"
                : "[file]";
            lastLabel = text;
            lastWho = "seller";
          } else {
            lastLabel = "Đã trả lời";
            lastWho = "user";
          }
        }
        setThreads((prev) =>
          prev.map((t) => (t.id === activeThreadId ? { ...t, last: lastLabel, lastWho } : t))
        );
      } catch (e) {
        console.error("fetch messages error", e);
      }
    }

    fetchMsgs();
    timer = setInterval(fetchMsgs, pollMs);
    return () => clearInterval(timer);
  }, [open, activeThreadId, pollMs]);

  // gửi text
  async function handleSend() {
    const text = input.trim();
    if (!text || !activeThreadId) return;
    setInput("");

    const now = timeNow();
    const localMsg = mkText("user", text, now);
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), localMsg],
    }));

    // Sidebar: bạn là người gửi cuối
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, last: "Đã trả lời", lastWho: "user" } : t
      )
    );

    try {
      await fetch(`${API_BASE}/api/messeger/threads/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, text }),
      });
    } catch (e) {
      console.error("send message error", e);
    }
  }

  function handleEmoji() {
    setInput((s) => (s ? s + " 🙂" : "🙂"));
  }

  // gửi file (chỉ ảnh/file)
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeThreadId) return;

    const now = timeNow();
    const tmpUrl = URL.createObjectURL(file);
    const isImg = file.type.startsWith("image/");

    setMessagesByThread((prev) => {
      const next = [...(prev[activeThreadId] || [])];
      if (isImg) next.push({ id: rid(), who: "user", kind: "image", src: tmpUrl, time: now } as ImageMsg);
      else next.push({ id: rid(), who: "user", kind: "file", name: file.name, time: now } as FileMsg);
      return { ...prev, [activeThreadId]: next };
    });

    // Sidebar: bạn là người gửi cuối
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, last: "Đã trả lời", lastWho: "user" } : t
      )
    );

    try {
      const fd = new FormData();
      fd.append("files", file);
      const up = await fetch(`${API_BASE}/api/messeger/upload`, { method: "POST", body: fd });
      const uploaded = await up.json();
      if (!Array.isArray(uploaded) || !uploaded.length) return;

      await fetch(`${API_BASE}/api/messeger/threads/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, text: "", attachments: uploaded }),
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
  type="button"
  className="chatbox-messenger-btn"
  aria-label={open ? "Đóng chat" : "Mở chat"}
  onClick={() => setOpen(!open)}
  title={open ? "Đóng chat" : "Mở chat"}
>
  <img src="/images/shop.png" alt="" aria-hidden="true" className="chatbox-messenger-btn-img" />
</button>
      {/* Box chat */}
      <div className={`chatbox-messenger ${open ? "show" : ""}`} role="dialog" aria-modal>
        {/* Sidebar (khi chỉ bấm icon sẽ thấy list từ API) */}
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
                    <div
                      className={
                        "chatbox-messenger-thread-last " +
                        (t.lastWho === "seller" ? "is-shop" : "is-user")
                      }
                      title={t.last}
                    >
                      {t.last}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main */}
        <div className="chatbox-messenger-main">
          <div className="chatbox-messenger-head">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={shopInfo?.avatar || activeThread?.avatar || "https://via.placeholder.com/32"}
                alt={shopInfo?.name || activeThread?.name || "Shop"}
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
              />
              <span className="chatbox-messenger-head-name">
                {shopInfo?.name ?? activeThread?.name ?? "Tin nhắn"}
              </span>
            </div>
            <button className="chatbox-messenger-close" aria-label="Đóng chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbox-messenger-msgs">
            {(messages ?? []).map((m) => (
              <div key={m.id} className={`chatbox-messenger-bubble chatbox-messenger-${m.who}`}>
                {m.kind === "text" && <div>{(m as TextMsg).text}</div>}
                {m.kind === "image" && (
                  <img src={(m as any).src} alt="Ảnh gửi" style={{ maxWidth: 180, borderRadius: 8 }} />
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
          <label htmlFor="fileUpload" className="ghost" title="Đính kèm ảnh">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
  </svg>
</label>

              <input
                id="fileUpload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
        :global(body){margin:0;font:14px/1.4 system-ui,sans-serif;background:#f3f4f6;}
        .chatbox-messenger-btn{position:fixed;bottom:18px;right:95px;z-index:1000;background:#fff;border:1px solid #ccc;border-radius:50%;width:60px;height:60px;font-size:22px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);color:#444;transition:transform .2s,box-shadow .2s;}
        .chatbox-messenger-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.15);}
        .chatbox-messenger{position:fixed;bottom:90px;right:20px;z-index:999;width:640px;height:550px;display:none;background:#fff;border:1px solid #e5e7eb;border-radius:3px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.16);color:#333;transform-origin:bottom right;opacity:0;transform:scale(.98);transition:opacity .18s,transform .18s;}
        .chatbox-messenger.show{display:flex;opacity:1;transform:scale(1);}
        .chatbox-messenger-sidebar{width:220px;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;background:#fff;}
        .chatbox-messenger-sidebar-head{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#444;}
        .chatbox-messenger-thread-list{flex:1;overflow:auto;}
        .chatbox-messenger-thread{width:100%;text-align:left;background:#fff;border:none;display:flex;gap:8px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;transition:background .15s;}
        .chatbox-messenger-thread:hover{background:#fafafa;}
        .chatbox-messenger-thread.active{background:#f0f0f0;}
        .chatbox-messenger-thread img{width:32px;height:32px;border-radius:50%;}
        .chatbox-messenger-thread-info{min-width:0;}
        .chatbox-messenger-thread-name{font-weight:600;color:#333;}
        .chatbox-messenger-thread-last{
          font-size:12px;
          line-height:1.2;
          max-width:100%;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .chatbox-messenger-thread-last.is-shop{ color:#FF0A0A; } /* shop: đỏ */
        .chatbox-messenger-thread-last.is-user{ color:#666; }    /* bạn: xám */
        .chatbox-messenger-main{flex:1;display:flex;flex-direction:column;background:#fff;}
        .chatbox-messenger-head{padding:10px 14px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;color:#444;font-weight:600;background:#fff;}
        .chatbox-messenger-close{background:none;border:1px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;color:#666;padding:4px 8px;}
        .chatbox-messenger-msgs{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:10px;background:#fafafa;}
        .chatbox-messenger-bubble{max-width:70%;padding:8px 12px;border-radius:12px;line-height:1.35;word-break:break-word;animation:fadeIn .18s;border:1px solid #ddd;}
        .chatbox-messenger-user{align-self:flex-end;color:#333;}
        .chatbox-messenger-seller{align-self:flex-start;background:#fff;color:#333;}
        .chatbox-messenger-meta{font-size:11px;color:#888;margin-top:4px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .chatbox-messenger-composer{border-top:1px solid #e5e7eb;padding:10px;background:#fff;display:flex;align-items:center;gap:8px;}
        .chatbox-messenger-input{flex:1;border:1px solid #ccc;border-radius:8px;padding:8px;font:inherit;color:#333;}
        .chatbox-messenger-tools{display:flex;gap:10px;align-items:center;color:#555;font-size:18px;}
        .ghost{background:none;border:none;cursor:pointer;padding:4px;border-radius:8px;}
        .chatbox-messenger-btn-send{background:#fff;color:#444;border:1px solid #444;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;}
        @media (max-width:700px){.chatbox-messenger{right:10px;width:calc(100vw - 20px);height:70vh}.chatbox-messenger-sidebar{display:none}}
        .chatbox-messenger-btn{
  position:fixed;
  bottom:18px;
  right:95px;
  z-index:1000;

  width:60px;
  height:60px;
  padding:0;
  border:0;                  /* bỏ viền */
 background:#fff;    border-radius:50%;
  overflow:hidden;           /* cắt sát theo bo tròn */
  cursor:pointer;

  box-shadow:none;           /* không đổ bóng => không “viền” ảo */
  display:inline-flex;
  align-items:center;
  justify-content:center;

  transition:transform .2s;
}
.chatbox-messenger-btn:hover{ transform:translateY(-1px); }

/* ảnh */
.chatbox-messenger-btn-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
  display:block;
  pointer-events:none;
}
        
      `}</style>
    </>
  );
}
