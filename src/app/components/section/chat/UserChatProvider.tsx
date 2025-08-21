"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Ctx = {
  open: boolean;
  threadId: string;
  openForShop: (shopId: string) => Promise<void>;
  close: () => void;
  setOpen: (v: boolean) => void;
};

const ChatCtx = createContext<Ctx | null>(null);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export function UserChatProvider({
  children,
  currentUserId,
}: {
  children: React.ReactNode;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState("");

  const openForShop = useCallback(async (shopId: string) => {
    if (!currentUserId || !shopId) return;
    try {
      const res = await fetch(`${API_BASE}/api/messeger/threads/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, shop_id: shopId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Mở thread thất bại");
      const tid = data?._id || data?.thread_id || "";
      setThreadId(tid);
      setOpen(true);
    } catch (e) {
      console.error("openForShop error:", e);
    }
  }, [currentUserId]);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, setOpen, threadId, openForShop, close }),
    [open, threadId, openForShop, close]
  );

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

/** Hook BẮT BUỘC có Provider (dùng nơi chắc chắn được bọc) */
export function useUserChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useUserChat must be used within UserChatProvider");
  return ctx;
}

/** Hook AN TOÀN (có thể null nếu chưa có Provider) */
export function useUserChatOptional() {
  return useContext(ChatCtx); // có thể null
}
