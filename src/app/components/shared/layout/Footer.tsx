"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

export default function FooterComponent() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // 1. Tối ưu hóa Resize Listener bằng cách sử dụng debounce hoặc kiểm tra đơn giản
  useEffect(() => {
    const checkWidth = () => {
      const desktop = window.innerWidth > 768;
      // Chỉ cập nhật state nếu giá trị thực sự thay đổi để tránh re-render thừa
      setIsDesktop((prev) => (prev !== desktop ? desktop : prev));
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // 2. Sử dụng useCallback để tránh tạo lại hàm khi re-render
  const toggleSection = useCallback((section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  }, []);

  // 3. Tách dữ liệu ra khỏi quá trình render để code sạch hơn (Memoized)
  const sections = useMemo(() => [
    {
      title: "Sàn thương mại Fiyo",
      content: (
        <div className="footer-contact-info">
          <p>Số ĐKKD: 0107574310, ngày cấp: 23/09/2016, nơi cấp: Sở KHĐT Hà Nội</p>
          <p>Địa chỉ: Số 688 Đường Quang Trung, Phường La Khê, Hà Đông, Hà Nội</p>
          <p>Email: <a href="mailto:hello@fiyo.com">hello@fiyo.com</a></p>
          <p>Hotline: <a href="tel:0123456789">0123 456 789</a></p>
        </div>
      ),
    },
    {
      title: "Thương hiệu",
      content: (
        <ul>
          <li><Link href="/page/about">Giới thiệu</Link></li>
          <li><Link href="/page/careers">Tuyển dụng</Link></li>
          <li><Link href="/page/stores">Hệ thống cửa hàng</Link></li>
        </ul>
      ),
    },
    {
      title: "Hỗ trợ",
      content: (
        <ul>
          <li><Link href="/page/faq">Hỏi đáp</Link></li>
          <li><Link href="/page/customer-policy">Chính sách KH</Link></li>
          <li><Link href="/page/shipping-policy">Chính sách vận chuyển</Link></li>
        </ul>
      ),
    },
    {
      title: "Fanpage",
      content: (
        <a href="https://www.facebook.com/fiyo" target="_blank" rel="noopener noreferrer">
          <img
            src="/images/image.png"
            alt="Fanpage Facebook"
            loading="lazy"
            style={{ maxWidth: 280, height: "auto", borderRadius: 8 }}
          />
        </a>
      ),
    },
  ], []);

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Newsletter Section */}
        <div className="footer-top">
          <h3>Đăng ký nhận bản tin</h3>
          <p className="footer-subtitle">
            Cùng Canifa Blog cập nhật những thông tin mới nhất về thời trang và phong cách sống.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Nhập email đăng ký của bạn"
              required
              aria-label="Email đăng ký"
            />
            <button type="submit">Đăng ký</button>
          </form>
          <div className="social-icons">
            <SocialLink href="https://facebook.com" icon="fa-facebook-f" label="Facebook" />
            <SocialLink href="https://instagram.com" icon="fa-instagram" label="Instagram" />
            <SocialLink href="https://youtube.com" icon="fa-youtube" label="YouTube" />
            <SocialLink href="https://tiktok.com" icon="fa-tiktok" label="TikTok" />
          </div>
        </div>

        {/* Accordion Section */}
        <div className="footer-bottom">
          {sections.map((section) => {
            const isOpen = isDesktop || openSection === section.title;
            return (
              <div key={section.title} className="footer-section">
                <h4 
                  onClick={() => !isDesktop && toggleSection(section.title)}
                  className={!isDesktop ? "clickable" : ""}
                >
                  {section.title}
                  {!isDesktop && (
                    <span className="toggle-icon">{isOpen ? "−" : "+"}</span>
                  )}
                </h4>
                <div 
                  className={`footer-content-toggle ${isOpen ? "open" : ""}`}
                  style={{ display: isOpen ? "block" : "none" }}
                >
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

// 4. Sub-component nhỏ để tối ưu và tái sử dụng
function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <i className={`fab ${icon}`} />
    </a>
  );
}