"use client";

import { useState } from "react";
import UserThreads from "@/app/components/section/messenger/UserThreads";
import SellerThreads from "@/app/components/section/messenger/SellerThreads";
import ChatBox from "@/app/components/section/messenger/ChatBox";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

// TODO: Thay 3 ID dưới đây bằng ObjectId thật trong DB của bạn
const USER_ID_KHACH = "688d0bec0dcc4af92ab16bc1";
const SELLER_USER_ID = "6899df8c8fbd49e59ff86b01"; // chủ shop
const SHOP_ID = "68a466c6566d4a95019d201c";

export default function TestMessengerPage() {
  const [threadId, setThreadId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeRole, setActiveRole] = useState<"user" | "seller">("user"); // ✅ chỉ panel active mới mark read

  const bump = () => setRefreshKey((k) => k + 1);

  const openThread = async () => {
    const res = await fetch(`${API_BASE}/api/messeger/threads/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID_KHACH, shop_id: SHOP_ID }),
    });
    const data = await res.json();
    if (res.ok) setThreadId(data?._id);
    else alert(data?.message || "Open thread failed");
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-4">
        <div className="p-3 border rounded-xl">
          <div className="font-semibold mb-2">Tạo/Lấy Thread</div>
          <div className="text-xs text-gray-600">
            USER: <code>{USER_ID_KHACH}</code>
            <br />
            SELLER USER: <code>{SELLER_USER_ID}</code>
            <br />
            SHOP: <code>{SHOP_ID}</code>
          </div>
          <button onClick={openThread} className="mt-3 px-3 py-2 border rounded-lg text-sm">
            Open Thread (User ↔ Shop)
          </button>
          <div className="mt-2 text-xs">
            Thread ID: <b>{threadId || "(chưa có)"}</b>
          </div>

          {/* Chọn panel đang active để điều khiển mark read */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setActiveRole("user")}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                activeRole === "user" ? "bg-black text-white" : ""
              }`}
            >
              Xem như User
            </button>
            <button
              onClick={() => setActiveRole("seller")}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                activeRole === "seller" ? "bg-black text-white" : ""
              }`}
            >
              Xem như Seller
            </button>
          </div>
        </div>

        <UserThreads
          userId={USER_ID_KHACH}
          onPickThread={setThreadId}
          selectedThreadId={threadId}
          refreshKey={refreshKey}     // ✅ refetch khi đọc xong
          // pollMs={3000}            // (tuỳ chọn) auto-poll list
        />

        <SellerThreads
          sellerUserId={SELLER_USER_ID}
          onPickThread={setThreadId}
          selectedThreadId={threadId}
          refreshKey={refreshKey}     // ✅ refetch khi đọc xong
          // pollMs={3000}            // (tuỳ chọn) auto-poll list
        />
      </div>

      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel User */}
          <ChatBox
            threadId={threadId}
            currentUserId={USER_ID_KHACH}
            role="user"
            useDetailed={false}
            onRead={bump}                                // ✅ báo list refetch
            markReadEnabled={activeRole === "user"}      // ✅ chỉ panel active mới mark read
            isActive={activeRole === "user"}
            // pollMs={3000}                              // (tuỳ chọn) auto-poll messages
          />

          {/* Panel Seller */}
          <ChatBox
            threadId={threadId}
            currentUserId={SELLER_USER_ID}
            role="seller"
            useDetailed={false}
            onRead={bump}                                // ✅ báo list refetch
            markReadEnabled={activeRole === "seller"}    // ✅ chỉ panel active mới mark read
            isActive={activeRole === "seller"}
            // pollMs={3000}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mẹo: dùng nút “Xem như User/Seller” để điều khiển panel nào được đánh dấu đã đọc.
        </p>
      </div>
    </div>
  );
}
