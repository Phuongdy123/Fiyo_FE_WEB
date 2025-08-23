"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FooterComponent() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth > 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleSection = (section: string) => {
    if (isDesktop) return; // desktop luôn mở
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      title: "Công ty cổ phần Canifa",
      content: (
        <>
          <p>
            Số ĐKKD: 0107574310, ngày cấp: 23/09/2016, nơi cấp: Sở KHĐT Hà Nội
          </p>
          <p>
            Địa chỉ: Số 688 Đường Quang Trung, Phường La Khê, Hà Đông, Hà Nội
          </p>
          <p>
            Email:{" "}
            <a href="mailto:hello@canifa.com" className="text-blue-600 underline">
              hello@fiyo.com
            </a>
          </p>
          <p>
            Hotline:{" "}
            <a href="tel:0123456789" className="text-blue-600 underline">
              0123 456 789
            </a>
          </p>
        </>
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
        <a
          href="https://www.facebook.com/canifa" // link fanpage thật của bạn
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://photo.salekit.com/uploads/fchat_5b4872d13803896dd77125af/cach-tao-fanpage-facebook.jpg"
            alt="Fanpage Facebook"
            style={{ maxWidth: 280, height: "auto", borderRadius: 8 }}
          />
        </a>
      ),
    },
  ];

  const onSubmitNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: gọi API subscribe nếu bạn có
  };

  return (
    <div className="footer">
      <div className="footer-content">
        {/* Top */}
        <div className="footer-top">
          <h3>Đăng ký nhận bản tin</h3>
          <p style={{ fontSize: 14 }}>
            Cùng Canifa Blog cập nhật những thông tin mới nhất về thời trang và
            phong cách sống.
          </p>
          <form className="newsletter-form" onSubmit={onSubmitNewsletter}>
            <input
              type="email"
              style={{ textAlign: "center" }}
              placeholder="Nhập email đăng ký của bạn"
              required
            />
            <button type="submit">Đăng ký</button>
          </form>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <i className="fab fa-youtube" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          {sections.map((section, i) => (
            <div key={i} className="footer-section">
              <h4 onClick={() => toggleSection(section.title)}>
                {section.title}
                <span className="toggle">
                  {openSection === section.title || isDesktop ? "−" : "+"}
                </span>
              </h4>
              <div
                className="footer-content-toggle"
                style={{
                  display:
                    openSection === section.title || isDesktop ? "block" : "none",
                }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
