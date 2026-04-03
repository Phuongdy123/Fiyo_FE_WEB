"use client";

import { useState, useEffect, useCallback } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Sử dụng useCallback để tránh tạo lại hàm khi re-render
  const toggleVisibility = useCallback(() => {
    // Ngưỡng 200px để hiện nút
    if (window.scrollY > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    // { passive: true } giúp trình duyệt cuộn mượt hơn, không bị khựng (jank)
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [toggleVisibility]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Trả về null nếu không hiển thị để sạch DOM
  if (!isVisible) return null;

  return (
    <button 
      type="button"
      className="back-to-top" 
      onClick={scrollToTop}
      aria-label="Về đầu trang"
    >
      <span className="screen-reader-text">TOP</span>
    </button>
  );
}