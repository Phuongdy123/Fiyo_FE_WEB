'use client';

import { useEffect, useState, useCallback, useMemo } from "react";

export default function SliderComponent() {
  // 1. Dùng useMemo để tránh mảng bị khởi tạo lại mỗi lần re-render
  const slides = useMemo(() => [
    {
      src: 'https://2885371169.e.cdneverest.net/pub/media/Simiconnector/BannerSlider/a/c/acn_topbanner_desktop-070525.webp',
      alt: 'Slide 1',
      link: '/page/product',
      showButton: true,
    },
    {
      src: 'https://2885371169.e.cdneverest.net/pub/media/Simiconnector/BannerSlider/v/i/viettin_topbanner_desktop-110625a.webp',
      alt: 'Slide 2',
      link: '/page/sale',
      showButton: true,
    },
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. Tách hàm chuyển slide để tái sử dụng và dùng useCallback để tối ưu
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // 3. Quản lý Interval hiệu quả
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="slideshow-container">
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.src} // Dùng src làm key sẽ tốt hơn dùng index
            className={`home-banner-slide fade ${isActive ? 'active' : ''}`}
            style={{
              display: isActive ? 'block' : 'none',
              position: 'relative',
            }}
          >
            {/* Giữ nguyên thẻ img theo ý bạn, thêm loading="lazy" cho các ảnh sau */}
            <img 
              src={slide.src} 
              alt={slide.alt} 
              loading={index === 0 ? "eager" : "lazy"} 
            />
            
            {slide.showButton && (
              <a href={slide.link} className="buy-now-btn">
                Mua ngay
              </a>
            )}
          </div>
        );
      })}

      <button className="prev" onClick={prevSlide} aria-label="Previous">
        ❮
      </button>
      <button className="next" onClick={nextSlide} aria-label="Next">
        ❯
      </button>
    </div>
  );
}