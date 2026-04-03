"use client";

import { useEffect, useState } from "react";
import { useMinicart } from "@/app/context/MinicartContext";

interface AddToCartPopupProps {
  image: string;
  onClose: () => void;
}

export default function AddToCartPopup({ image, onClose }: AddToCartPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { open } = useMinicart(); // Sử dụng Context thay vì document.querySelector

  useEffect(() => {
    // 1. Hiệu ứng Fade-in nhẹ khi vừa mount
    const entryTimer = setTimeout(() => setIsVisible(true), 10);

    // 2. Tự động đóng sau 3 giây
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Chờ animation kết thúc rồi mới remove khỏi DOM
    }, 3000);

    // Cleanup để tránh Memory Leak
    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  }, [onClose]);

  const handleViewCart = () => {
    open(); // Mở Minicart thông qua state quản lý tập trung
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "120px",
        right: "20px",
        backgroundColor: "#fff",
        border: "1px solid #eee",
        padding: "15px 20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        zIndex: 9999,
        borderRadius: "4px",
        transition: "all 0.3s ease-in-out",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(20px)",
      }}
    >
      <img
        src={image || "https://placehold.co/65x65"}
        alt="Sản phẩm đã thêm"
        loading="eager"
        style={{ 
          width: 60, 
          height: 60, 
          marginRight: 15, 
          objectFit: "cover",
          borderRadius: "2px"
        }}
      />
      
      <div style={{ marginRight: 25, fontSize: "14px", color: "#333" }}>
        <p style={{ margin: 0, fontWeight: 500 }}>Đã thêm vào giỏ hàng!</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Sản phẩm mới vừa được thêm.</p>
      </div>

      <button
        onClick={handleViewCart}
        style={{
          padding: "10px 15px",
          border: "1px solid #000",
          background: "#000",
          color: "#fff",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          transition: "background 0.2s",
        }}
      >
        Xem giỏ hàng
      </button>

      {/* Nút X đóng nhanh */}
      <button 
        onClick={onClose}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "16px",
          color: "#999"
        }}
      >
        ×
      </button>
    </div>
  );
}