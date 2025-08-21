"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/app/components/section/messenger/ChatWitget";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

const USER_ID = "688d0bec0dcc4af92ab16bc1";
const SHOP_ID = "68a466c6566d4a95019d201c";

export default function TestWidgetPage() {
  const [threadId, setThreadId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/messeger/threads/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: USER_ID, shop_id: SHOP_ID }),
        });
        const data = await res.json();
        if (res.ok) setThreadId(data._id);
      } catch (err) {
        console.error("open thread error", err);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-bold">Test Chat Widget</h1>

      {/* Nút bật/tắt */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md"
      >
        {open ? "Đóng chat" : "Mở chat"}
      </button>

      {/* Hiện box chat khi open = true */}
      {open && threadId && (
        <div className="fixed bottom-5 right-5 w-96 shadow-xl border rounded-xl bg-white z-50">
          <ChatWidget
            threadId={threadId}
            currentUserId={USER_ID}
            role="user"
            apiBase={API_BASE}
            pollMs={3000}
            markReadEnabled={true}
            isActive={true}
            open={open}          // 🟢 truyền state xuống
            onClose={() => setOpen(false)} // 🟢 callback đóng
          />
        </div>
      )}
    </div>
  );
}
