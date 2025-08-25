"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Đồng bộ giờ server đơn giản: gọi HEAD tới chính domain để lấy Date header
 * Nếu không muốn request, bỏ phần sync và dùng Date.now() bình thường.
 */
async function fetchServerNow(): Promise<number | null> {
  try {
    const res = await fetch("/", { method: "HEAD", cache: "no-store" });
    const serverDate = res.headers.get("date");
    if (!serverDate) return null;
    return new Date(serverDate).getTime();
  } catch {
    return null;
  }
}

export function useCountdown(startAtISO: string | Date, endAtISO: string | Date, syncServerTime = true) {
  const startAt = useMemo(() => new Date(startAtISO).getTime(), [startAtISO]);
  const endAt   = useMemo(() => new Date(endAtISO).getTime(), [endAtISO]);

  const [now, setNow] = useState<number>(Date.now());
  const driftRef = useRef<number>(0); // sai lệch so với server (ms)

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!syncServerTime) return;
      const serverNow = await fetchServerNow();
      if (mounted && serverNow) {
        driftRef.current = serverNow - Date.now(); // (+) nghĩa là client chậm hơn server
        setNow(Date.now() + driftRef.current);
      }
    })();
    return () => { mounted = false; };
  }, [syncServerTime]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now() + driftRef.current), 1000);
    return () => clearInterval(i);
  }, []);

  const status: "upcoming" | "running" | "ended" = useMemo(() => {
    if (now < startAt) return "upcoming";
    if (now >= startAt && now <= endAt) return "running";
    return "ended";
  }, [now, startAt, endAt]);

  const msLeft = Math.max(0, (status === "upcoming" ? startAt : endAt) - now);

  const d = Math.floor(msLeft / (24 * 3600_000));
  const h = Math.floor((msLeft % (24 * 3600_000)) / 3600_000);
  const m = Math.floor((msLeft % 3600_000) / 60_000);
  const s = Math.floor((msLeft % 60_000) / 1000);

  return { now, status, d, h, m, s, msLeft, startAt, endAt };
}
