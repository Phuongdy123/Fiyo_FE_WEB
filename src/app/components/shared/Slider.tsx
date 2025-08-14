'use client';
import { useEffect,useState } from "react";
export default function SliderComponent(){
     const slides = [
 
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
];

    const [currentSlide, setCurrentSlide] = useState(0);

    // tự động chuyển slide 
    useEffect(() =>{
        const interval = setInterval(()=>{
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval)
    }, [slides.length]);
     return (
  <div className="slideshow-container">
  {slides.map((slide, index) => (
    <div
      key={index}
      className={`home-banner-slide fade ${
        index === currentSlide ? 'active' : ''
      }`}
      style={{
        display: index === currentSlide ? 'block' : 'none',
        position: 'relative',
      }}
    >
      <img src={slide.src} alt={slide.alt} />
      {slide.showButton && (
        <a
          href={slide.link}
          className="buy-now-btn"
        >
          Mua ngay
        </a>
      )}
    </div>
  ))}
  <button
    className="prev"
    onClick={() =>
      setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length)
    }
  >
    ❮
  </button>
  <button
    className="next"
    onClick={() => setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)}
  >
    ❯
  </button>
</div>

  );
}