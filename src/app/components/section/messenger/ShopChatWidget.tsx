"use client";

import "@/app/assets/css/boxchat.css";
import { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "seller";
type Attachment = { url: string; name?: string; type?: string; size?: number; mimetype?: string };
type Msg = {
  _id: string;
  thread_id: string;
  sender: Role;
  text: string;
  attachments?: Attachment[];
  createdAt: string;
  readBy?: Role[];
};

export default function ShopChatWidget({
  threadId,
  currentUserId,
  apiBase = "http://localhost:3000",
  pollMs = 3000,
  markReadEnabled = true,
  isActive = true,
  open,
  onClose,
  shopLabel = "Shop -",
  role = "seller", // 🟢 mặc định seller (shop)
}: {
  threadId: string;
  currentUserId: string;
  apiBase?: string;
  pollMs?: number;
  markReadEnabled?: boolean;
  isActive?: boolean;
  open: boolean;
  onClose: () => void;
  shopLabel?: string;
  role?: Role; // 🟢 có thể truyền, nhưng mặc định "seller"
}) {
  // dùng role từ props (mặc định "seller")
  const chatListRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const headerHeight = 75;

  const scrollToEnd = () => {
    chatListRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMsgs = async () => {
    if (!threadId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `${apiBase}/api/messeger/threads/${threadId}/messages?page=1&limit=200`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Fetch messages failed");
      setMsgs(Array.isArray(data) ? data : []);

      if (markReadEnabled && isActive && document.visibilityState === "visible") {
        await fetch(`${apiBase}/api/messeger/threads/${threadId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: currentUserId, role }),
        });
      }
    } catch (e: any) {
      setErr(e?.message || "Fetch failed");
    } finally {
      setLoading(false);
      setTimeout(scrollToEnd, 50);
    }
  };

  useEffect(() => {
    fetchMsgs();
    if (pollMs > 0) {
      const t = setInterval(fetchMsgs, pollMs);
      return () => clearInterval(t);
    }
  }, [threadId, currentUserId, pollMs]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) setFiles((prev) => [...prev, ...list]);
    e.currentTarget.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const uploadFiles = async (): Promise<Attachment[]> => {
    if (files.length === 0) return [];
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch(`${apiBase}/api/messeger/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      return (Array.isArray(data) ? data : []).map((f: any) => ({
        url: f.url,
        name: f.name,
        type: f.type,
        size: f.size,
        mimetype: f.mimetype,
      }));
    } finally {
      setUploading(false);
    }
  };

  const send = async () => {
    const content = text.trim();
    if (!content && files.length === 0) return;
    if (!threadId || sending || uploading) return;

    setSending(true);
    setErr("");

    try {
      const attachments = await uploadFiles();

      const res = await fetch(`${apiBase}/api/messeger/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          text: content,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Send failed");

      setText("");
      setFiles([]);
      await fetchMsgs();
    } catch (e: any) {
      setErr(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const empty = useMemo(() => !loading && msgs.length === 0, [loading, msgs]);

  return (
    <div className={`chat-wrapper state-1 ${open ? "" : "hidden"}`}>
      <div className="chat-wrapper-inner">
        <div className="chat-close-wrapper">
          <button className="chat-close-button" onClick={onClose}>
            <img
              src="https://widget.oncustomer.canifa.com/images/icon-close.svg"
              width={9}
              alt="x"
            />
          </button>
        </div>

        <div className="conversation">
          <div className="chat-main-frame">
            {/* Header */}
            <div className="chat-header theme-color-bg-non-hover" style={{ height: 75 }}>
              <div className="widget-header">
                <div className="new-conversation-header">
                  <div className="description-group">
                    <h3 className="title margin-0 title-2">{shopLabel}</h3>
                    <p className="sub-title">Shop có thể trả lời khách hàng ở đây</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nội dung */}
            <div
              className="chat-content list-conversation under-header-view"
              style={{ height: `calc(100% - ${headerHeight}px)` }}
            >
              <div className="chat-content-inner">
                <ul className="message-list" ref={chatListRef}>
                  {loading && <li>Đang tải…</li>}
                  {err && <li className="text-red-600">{err}</li>}
                  {empty && <li>Chưa có tin nhắn.</li>}
                  {msgs.map((m) => {
                    const mine = m.sender === role;
                    return (
                      <li key={m._id}>
                        <div
                          className={`inline-block max-w-[80%] px-3 py-2 rounded-2xl ${
                            mine ? "bg-green-600 text-white ml-auto" : "bg-white border mr-auto"
                          }`}
                        >
                          {m.text && <div>{m.text}</div>}
                          <div className="text-[10px] mt-1 opacity-70">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Nhập */}
            <div className="input-box">
              <div className="place-input">
                <textarea
                  className="ant-input main-input"
                  placeholder="Nhập phản hồi cho khách..."
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
                  }
                />
                <div className="composer-button">
                  <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={onPickFiles}
                  />
                  <button onClick={() => fileInputRef.current?.click()}>📎</button>
                  <button onClick={send} disabled={sending || uploading}>
                    ➤
                  </button>
                </div>
              </div>
              {files.length > 0 && (
                <div className="p-2 border-t bg-white">
                  {files.map((f, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      {f.name}
                      <button onClick={() => removeFile(i)}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
