"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AddToCartPopupProps {
  image: string;
  onClose: () => void;
}

export default function AddToCartPopup({
  image,
  onClose,
}: AddToCartPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "120px",
        right: "20px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        padding: "20px 30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        zIndex: 100,
        borderRadius: 2,
      }}
    >
      <img
        src={image}
        alt="product"
        style={{ width: 65, height: 65, marginRight: 12, objectFit: "cover" }}
      />
      <div style={{ marginRight: 20 }}>
        <div>Đã thêm sản phẩm</div>
        <div>vào giỏ hàng!</div>
      </div>
      <button
        style={{
          padding: "12px 12px",
          border: "1px solid #000",
          background: "#fff",
          cursor: "pointer",
          borderRadius: 1,
          fontWeight: "bold",
        }}
        onClick={() => {
          const minicart = document.querySelector(".minicart");
          minicart?.classList.add("active");
          onClose();
        }}
      >
        Xem giỏ hàng
      </button>
    </div>
  );
}
