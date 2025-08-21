"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/app/components/section/messenger/ChatWitget";
import ShopChatWidget from "@/app/components/section/messenger/ShopChatWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

// các id test trong DB (fake cứng để thử)
const USER_ID = "688d0bec0dcc4af92ab16bc1";
const SHOP_ID = "68a466c6566d4a95019d201c";

export default function TestChatPage() {
  const [threadId, setThreadId] = useState("");
  const [openUser, setOpenUser] = useState(true);
  const [openShop, setOpenShop] = useState(true);

  // khởi tạo thread giữa user và shop
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

  if (!threadId) return <div className="p-6">Đang khởi tạo thread…</div>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-bold">Trang Test Chat Song Song</h1>
      <p className="text-sm text-gray-600">
        Bên trái là panel của <b>User</b>, bên phải là panel của <b>Shop</b>.  
        Mỗi bên tự gọi <code>/read</code> khi mở và active → `readBy` sẽ nhảy đúng nghiệp vụ.
      </p>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 border rounded bg-blue-500 text-white"
          onClick={() => setOpenUser((v) => !v)}
        >
          {openUser ? "Đóng panel User" : "Mở panel User"}
        </button>
        <button
          className="px-3 py-1 border rounded bg-green-600 text-white"
          onClick={() => setOpenShop((v) => !v)}
        >
          {openShop ? "Đóng panel Shop" : "Mở panel Shop"}
        </button>
      </div>

      {/* Panel User (vai trò user) */}
      {openUser && (
        <div className="fixed bottom-5 left-5 w-96 z-50 border rounded shadow-lg bg-white">
          <ChatWidget
            threadId={threadId}
            currentUserId={USER_ID}
            role="user"
            apiBase={API_BASE}
            pollMs={3000}
            markReadEnabled={true}
            isActive={true}
            open={openUser}
            onClose={() => setOpenUser(false)}
          />
        </div>
      )}

      {/* Panel Shop (vai trò seller) */}
      {openShop && (
        <div className="fixed bottom-5 right-5 w-96 z-50 border rounded shadow-lg bg-white">
          <ShopChatWidget
            threadId={threadId}
            currentUserId={SHOP_ID}
            apiBase={API_BASE}
            pollMs={3000}
            markReadEnabled={true}
            isActive={true}
            open={openShop}
            onClose={() => setOpenShop(false)}
            shopLabel="Shop -"
            // role mặc định trong ShopChatWidget là "seller"
          />
        </div>
      )}
    </div>
  );
}
