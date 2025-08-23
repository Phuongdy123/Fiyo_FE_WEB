"use client";
import { useEffect, useRef, useState } from "react";


type Message = {
  _id: string;
  who: "user" | "seller";
  text?: string;
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

function ShopChatDock({ shopId, threadId }: { shopId: string; threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // fetch 1 lần khi có threadId
  useEffect(() => {
    if (!threadId) return;
    refreshOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // auto-scroll khi có tin mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function refreshOnce() {
    if (!threadId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/messeger/threads/${threadId}/messages?page=1&limit=200`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const list: Message[] = Array.isArray(data)
        ? data.map((m: any) => ({
            _id: m._id,
            who: (m.sender || m.from) === "seller" ? "seller" : "user",
            text: m.text,
            createdAt: m.createdAt,
          }))
        : [];
      setMessages(list);
    } catch (err) {
      console.error("fetch messages error", err);
    }
  }

  // Gửi tin nhắn (append local + POST + refresh 1 lần)
  async function sendMsg() {
    if (!input.trim() || !threadId) return;
    const text = input.trim();
    setInput("");

    // append local trước để thấy ngay
    setMessages((prev) => [
      ...prev,
      { _id: String(Date.now()), who: "seller", text, createdAt: new Date().toISOString() },
    ]);

    try {
      await fetch(`${API_BASE}/api/messeger/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // QUAN TRỌNG: xác định rõ chiều gửi là seller
        body: JSON.stringify({ shop_id: shopId, text, sender: "seller" }),
      });
      // lấy lại dữ liệu thực từ server (id/time chuẩn)
      refreshOnce();
    } catch (err) {
      console.error("send message error", err);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        width: 420,
        height: 520,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #eee",
          background: "#fff",
          fontWeight: 600,
        }}
      >
        Shop Chat (thread: {threadId ? threadId.slice(-6) : "—"})
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((m) => (
          <div
            key={m._id}
            style={{
              maxWidth: "70%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: m.who === "seller" ? "#daf1da" : "#fff",
              alignSelf: m.who === "seller" ? "flex-end" : "flex-start",
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
            title={m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, borderTop: "1px solid #eee", padding: 10, background: "#fff" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Nhập tin nhắn…"
          style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: "8px" }}
        />
        <button
          onClick={sendMsg}
          style={{ border: "1px solid #444", borderRadius: 8, padding: "8px 12px", background: "#fff", cursor: "pointer" }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

/** ====== Test Page ====== */
export default function ChatTestPage() {
  const [shopId, setShopId] = useState("");
  const [userId, setUserId] = useState("");
  const [threadId, setThreadId] = useState("");

  async function openOrCreateThread() {
    if (!shopId || !userId) return alert("Nhập shopId và userId trước nhé!");
    try {
      const res = await fetch(`${API_BASE}/api/messeger/threads/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Open thread failed");
      const tid = data?._id || data?.thread_id;
      if (!tid) throw new Error("Server không trả thread_id");
      setThreadId(tid);
    } catch (err: any) {
      console.error("open thread error:", err);
      alert(err?.message || "Mở thread thất bại");
    }
  }

  function loadByThreadId() {
    if (!threadId) return alert("Dán threadId vào trước nhé!");
    // ShopChatDock sẽ tự fetch 1 lần theo threadId
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <h1>Shop Chat — Test Page</h1>

      <div
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 600,
          gridTemplateColumns: "1fr 1fr auto",
          alignItems: "center",
        }}
      >
        <input
          placeholder="shopId"
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          style={{ border: "1px solid #ccc", borderRadius: 8, padding: "8px" }}
        />
        <input
          placeholder="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ border: "1px solid #ccc", borderRadius: 8, padding: "8px" }}
        />
        <button
          onClick={openOrCreateThread}
          style={{ border: "1px solid #444", borderRadius: 8, padding: "8px 12px", background: "#fff", cursor: "pointer" }}
        >
          Open / Create Thread
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 600,
          gridTemplateColumns: "2fr auto",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Paste existing threadId"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          style={{ border: "1px solid #ccc", borderRadius: 8, padding: "8px" }}
        />
        <button
          onClick={loadByThreadId}
          style={{ border: "1px solid #444", borderRadius: 8, padding: "8px 12px", background: "#fff", cursor: "pointer" }}
        >
          Load
        </button>
      </div>

      <div>
        {shopId && threadId ? (
          <ShopChatDock shopId={shopId} threadId={threadId} />
        ) : (
          <div style={{ color: "#666" }}>
            Điền <b>shopId</b> + <b>userId</b> rồi bấm <i>Open / Create Thread</i>,
            hoặc dán sẵn <b>threadId</b> và bấm <i>Load</i>.
          </div>
        )}
      </div>
    </div>
  );
}
