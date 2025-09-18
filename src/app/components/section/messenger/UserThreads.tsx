"use client";

import { useEffect, useMemo, useState } from "react";

type Thread = {
  _id: string;
  user_id: { _id: string; name: string; avatar?: string };
  shop_id: { _id: string; name: string; avatar?: string };
  lastMessage?: { text?: string; at?: string; from?: "user" | "seller" };
  unread_user: number;
  unread_seller: number;
  updatedAt: string;
};

export default function UserThreads({
  userId,
  onPickThread,
  selectedThreadId,                       // (optional) để highlight
  refreshKey = 0,                         // 🔁 đổi key -> refetch
  pollMs = 0,                             // (optional) auto-refresh theo ms (0 = off)
  apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo-be.onrender.com",
}: {
  userId: string;
  onPickThread: (threadId: string) => void;
  selectedThreadId?: string;
  refreshKey?: number;
  pollMs?: number;
  apiBase?: string;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(d);
  };

  const fetchThreads = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      setErr("");
      const res = await fetch(
        `${apiBase}/api/messeger/threads/me/user?user_id=${userId}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Fetch threads failed");
      setThreads(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Fetch threads failed");
    } finally {
      setLoading(false);
    }
  };

  // fetch khi mount / đổi userId / đổi refreshKey
  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey]);

  // optional: auto-poll
  useEffect(() => {
    if (!pollMs) return;
    const t = setInterval(fetchThreads, pollMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pollMs]);

  const empty = useMemo(() => !loading && !err && threads.length === 0, [loading, err, threads]);

  return (
    <div className="p-3 border rounded-xl">
      <div className="font-semibold mb-2">Hội thoại của User</div>
      {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
      {empty && <div className="text-sm text-gray-500">Chưa có hội thoại.</div>}

      <ul className="space-y-2">
        {threads.map((t) => {
          const shopName = t.shop_id?.name || "Cửa hàng";
          const isActive = selectedThreadId === t._id;
          const fromShop = t.lastMessage?.from === "seller";
          const cnt = Number.isFinite(t.unread_user) ? t.unread_user : 0; // ✅ luôn có số
          return (
            <li
              key={t._id}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer hover:bg-gray-50
              ${isActive ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => onPickThread(t._id)}
              title={t.lastMessage?.at ? `Cập nhật: ${formatTime(t.lastMessage.at)}` : undefined}
            >
              <div className="flex items-center gap-3">
                <img
                  src={t.shop_id?.avatar || "/images/default-avatar.png"}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/default-avatar.png";
                  }}
                />
                <div>
                  <div className="font-medium">{shopName}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">
                    <span className="mr-1">{fromShop ? "Shop:" : "Bạn:"}</span>
                    {t.lastMessage?.text || "(ảnh/tệp)"}
                  </div>
                  {t.lastMessage?.at && (
                    <div className="text-[10px] text-gray-400">{formatTime(t.lastMessage.at)}</div>
                  )}
                </div>
              </div>

              {/* ✅ badge luôn hiển thị 0/1/2... */}
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  cnt > 0 ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                aria-label={`Chưa đọc: ${cnt}`}
              >
                {cnt}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2 mt-3">
        <button
          onClick={fetchThreads}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
