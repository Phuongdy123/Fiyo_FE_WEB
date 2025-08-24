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

export default function ChatWidget({
  threadId,
  currentUserId,
  role,
  apiBase = "https://fiyo.click",
  pollMs = 3000,
  markReadEnabled = true,
  isActive = true,
  open,          // 🟢 nhận từ cha
  onClose,       // 🟢 callback từ cha
}: {
  threadId: string;
  currentUserId: string;
  role: Role;
  apiBase?: string;
  pollMs?: number;
  markReadEnabled?: boolean;
  isActive?: boolean;
  open: boolean;       // 🟢 bắt buộc truyền
  onClose: () => void; // 🟢 bắt buộc truyền
}) {
  // ====== UI refs ======
  const chatListRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ====== state ======
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const headerHeight = 75;

  // ====== helpers ======
  const scrollToEnd = () => {
    const el = chatListRef.current;
    if (!el) return;
    el.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  // ====== fetch messages ======
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
  }, [threadId, role, currentUserId, isActive, markReadEnabled, pollMs]);

  // ====== file pick / preview / upload ======
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

  // ====== send ======
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

  // ====== render ======
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
            <div className="chat-header livechat theme-color-bg-non-hover" style={{ height: 75 }}>
              <div className="widget-header">
                <div className="new-conversation-header">
                  <div className="description-group">
                    <h3 className="title margin-0 title-2">CHAT BOT FIYO</h3>
                    <p className="sub-title">
                      Hãy hỏi bất cứ điều gì hoặc chia sẻ phản hồi của bạn liên quan đến SP &amp; DV.
                    </p>
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
                <ul className="message-list" ref={chatListRef}>
                  {loading && <li className="text-xs text-gray-500 px-3 py-1">Đang tải…</li>}
                  {err && <li className="text-xs text-red-600 px-3 py-1">{err}</li>}
                  {empty && <li className="text-xs text-gray-500 px-3 py-1">Chưa có tin nhắn.</li>}
                  {msgs.map((m) => {
                    const mine = m.sender === role;
                    return (
                      <li key={m._id} className="px-3 py-1">
                        <div
                          className={`inline-block max-w-[80%] px-3 py-2 rounded-2xl ${
                            mine ? "bg-blue-600 text-white ml-auto" : "bg-white border mr-auto"
                          }`}
                          title={new Date(m.createdAt).toLocaleString()}
                          style={{ display: "block" }}
                        >
                          {m.text && (
                            <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                          )}
                          {/* attachments */}
                          {m.attachments?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {m.attachments.map((att, idx) => {
                                const isImg =
                                  att.type === "image" || (att.mimetype || "").startsWith("image/");
                                const isVid =
                                  att.type === "video" || (att.mimetype || "").startsWith("video/");
                                if (isImg) {
                                  return (
                                    <a key={idx} href={att.url} target="_blank" rel="noreferrer">
                                      <img
                                        src={att.url}
                                        alt={att.name || `img-${idx}`}
                                        className="w-28 h-28 object-cover rounded border"
                                      />
                                    </a>
                                  );
                                }
                                if (isVid) {
                                  return (
                                    <video key={idx} className="w-56 rounded border" controls>
                                      <source src={att.url} />
                                    </video>
                                  );
                                }
                                return (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`block text-xs underline ${
                                      mine ? "text-white" : "text-blue-600"
                                    }`}
                                  >
                                    {att.name || "Tệp đính kèm"}
                                  </a>
                                );
                              })}
                            </div>
                          ) : null}
                          <div
                            className={`text-[10px] mt-1 opacity-70 ${
                              mine ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Nhập tin nhắn */}
            <div className="input-box input-status-undefined">
              <div className="place-input">
                <textarea
                  className="ant-input main-input"
                  placeholder="Nhập tin nhắn"
                  style={{ minHeight: 57, maxHeight: 300 }}
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
                  }
                />
                <div className="composer-button" style={{ alignItems: "center" }}>
                  <span>
                    <div className="ant-upload ant-upload-select ant-upload-select-text">
                      <span className="ant-upload" role="button">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.gif,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.mp4,.mkv,.webm,.zip"
                          multiple
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={onPickFiles}
                        />
                        <button
                          type="button"
                          className="ant-btn reply-tool-icon no-border"
                          onClick={() => fileInputRef.current?.click()}
                          title="Đính kèm"
                        >
                          <img src="https://widget.oncustomer.canifa.com/images/icon-attachment.png" />
                        </button>
                      </span>
                    </div>
                  </span>
                  <button type="button" className="ant-btn reply-tool-icon no-border" title="Emoji">
                    <img src="https://widget.oncustomer.canifa.com/images/icon-emoji.svg" />
                  </button>
                  <button
                    type="button"
                    className="ant-btn reply-tool-icon no-border"
                    style={{ marginLeft: 8 }}
                    onClick={send}
                    disabled={sending || uploading || (!text.trim() && files.length === 0)}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/724/724954.png"
                      width={20}
                      alt="send"
                      style={{
                        opacity:
                          sending || uploading || (!text.trim() && files.length === 0) ? 0.4 : 1,
                      }}
                    />
                  </button>
                </div>
              </div>
              {/* files preview */}
              {files.length > 0 && (
                <div className="p-2 border-t bg-white">
                  <div className="text-xs mb-1 text-gray-600">Đính kèm ({files.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => {
                      const isImg = f.type.startsWith("image/");
                      const isVid = f.type.startsWith("video/");
                      const url = URL.createObjectURL(f);
                      return (
                        <div key={i} className="relative">
                          {isImg ? (
                            <img src={url} alt={f.name} className="w-20 h-20 object-cover rounded border" />
                          ) : isVid ? (
                            <video className="w-28 rounded border" src={url} controls />
                          ) : (
                            <div className="w-28 h-20 rounded border flex items-center justify-center text-[10px] px-1">
                              {f.name}
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(i)}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* end input */}
          </div>
        </div>
      </div>
    </div>
  );
}
