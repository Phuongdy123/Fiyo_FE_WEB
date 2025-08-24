"use client";
import React, { createContext, useContext, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";

type ShopInfo = { _id: string; name: string; avatar?: string };

type Ctx = {
  open: boolean;
  threadId: string;
  shopInfo: ShopInfo | null;
  setOpen: (v: boolean) => void;
  openForShop: (shopId: string) => Promise<void>;
  close: () => void;
};

const ChatCtx = createContext<Ctx | null>(null);

export function UserChatProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  async function openForShop(shopId: string) {
    if (!currentUserId || !shopId) return;
    try {
      const res = await fetch(`${API_BASE}/api/messeger/threads/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, shop_id: shopId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Mở thread thất bại");

      setThreadId(data?._id || data?.thread_id || "");
      const s = data?.shop_id || data?.shop;
      if (s?._id) setShopInfo({ _id: s._id, name: s.name, avatar: s.avatar });
      setOpen(true);
    } catch (e) {
      console.error("openForShop error:", e);
    }
  }

  function close() {
    setOpen(false);
  }

  return (
    <ChatCtx.Provider value={{ open, setOpen, threadId, shopInfo, openForShop, close }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useUserChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useUserChat must be used within UserChatProvider");
  return ctx;
}
