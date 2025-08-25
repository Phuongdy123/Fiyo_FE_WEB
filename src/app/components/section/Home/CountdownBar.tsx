"use client";

import { useCountdown } from "../../../assets/js/useCountdown";

type Props = {
  startAt: string;
  endAt: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownBar({ startAt, endAt }: Props) {
  const { status, d, h, m, s } = useCountdown(startAt, endAt, true);

  if (status === "ended") return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap", // 👈 tự xuống dòng nếu hẹp
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {d > 0 && (
          <>
            <Pill value={pad(d)} />
            <Colon />
          </>
        )}
        <Pill value={pad(h)} />
        <Colon />
        <Pill value={pad(m)} />
        <Colon />
        <Pill value={pad(s)} />
      </div>
    </div>
  );
}

function Pill({ value }: { value: string }) {
  return (
    <span
      style={{
        minWidth: "clamp(28px, 8vw, 40px)", // 👈 thu nhỏ trên mobile
        padding: "2px 6px",
        borderRadius: 6,
        background: "#0f172a",
        color: "#fff",
        fontWeight: 800,
        fontSize: "clamp(12px, 3.5vw, 14px)", // 👈 responsive
        textAlign: "center",
        lineHeight: 1.4,
      }}
    >
      {value}
    </span>
  );
}

function Colon() {
  return (
    <span
      style={{
        fontWeight: 800,
        fontSize: "clamp(14px, 4vw, 18px)", // 👈 co giãn
      }}
    >
      :
    </span>
  );
}
