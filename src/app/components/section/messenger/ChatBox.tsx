"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  _id: string;
  thread_id: string;
  sender: "user" | "seller";
  text: string;
  createdAt: string;
  readBy?: string[];
};

export default function ChatBox({
  threadId,
  currentUserId,
  role, // "user" | "seller"
  apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000",
  useDetailed = false,
  onRead,
  pollMs = 3000,
  markReadEnabled = true,   // ✅ mới: cho phép bật/tắt mark read
  isActive = true,          // ✅ mới: chỉ mark read khi panel active
}: {
  threadId: string;
  currentUserId: string;
  role: "user" | "seller";
  apiBase?: string;
  useDetailed?: boolean;
  onRead?: () => void;
  pollMs?: number;
  markReadEnabled?: boolean; // ✅ khai báo mới
  isActive?: boolean;        // ✅ khai báo mới
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string>("");

  const endRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchMsgs = async () => {
    if (!threadId) return;
    setLoading(true);
    setErr("");
    try {
      const url = useDetailed
        ? `${apiBase}/api/messeger/threads/${threadId}/messages/detailed?page=1&limit=100`
        : `${apiBase}/api/messeger/threads/${threadId}/messages?page=1&limit=100`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Fetch messages failed");
      if (!mountedRef.current) return;
      setMsgs(Array.isArray(data) ? data : []);

      // ✅ chỉ mark read khi cho phép + panel đang active + tab đang visible
      if (markReadEnabled && isActive && document.visibilityState === "visible") {
        const mark = await fetch(`${apiBase}/api/messeger/threads/${threadId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: currentUserId, role }),
        });
        if (mark.ok) onRead?.();
      }
    } catch (e: any) {
      if (!mountedRef.current) return;
      setErr(e?.message || "Fetch failed");
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      setTimeout(scrollToEnd, 50);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchMsgs();
    let timer: any;
    if (pollMs > 0) timer = setInterval(fetchMsgs, pollMs);
    return () => {
      mountedRef.current = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, role, currentUserId, useDetailed, pollMs, markReadEnabled, isActive]);

  const send = async () => {
    const content = text.trim();
    if (!content || !threadId || sending) return;
    setSending(true);
    setErr("");
    try {
      const res = await fetch(`${apiBase}/api/messeger/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, text: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Send failed");
      setText("");
      await fetchMsgs();
    } catch (e: any) {
      setErr(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[480px] border rounded-xl">
      <div className="px-3 py-2 border-b text-sm flex items-center justify-between">
        <div>
          Thread: <b>{threadId || "-"}</b> — Vai trò: <b>{role}</b>
        </div>
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {loading && <div className="text-xs text-gray-500">Đang tải…</div>}
        {msgs.map((m) => {
          const mine = m.sender === role;
          return (
            <div
              key={m._id}
              className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                mine ? "bg-blue-600 text-white ml-auto" : "bg-white border mr-auto"
              }`}
              title={new Date(m.createdAt).toLocaleString()}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
              <div className={`text-[10px] mt-1 opacity-70 ${mine ? "text-white" : "text-gray-500"}`}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Nhập tin nhắn…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className={`px-4 py-2 rounded-lg text-sm ${
            sending || !text.trim()
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-black text-white"
          }`}
        >
          {sending ? "Đang gửi…" : "Gửi"}
        </button>
      </div>
    </div>
  );
}
