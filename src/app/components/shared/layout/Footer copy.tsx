"use client"; 

import { useState } from "react";

export default function FooterComponent() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section:any) => {
    setOpenSection(openSection === section ? null : section);
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
          <form className="newsletter-form">
            <input
              type="email"
              style={{ textAlign: "center" }}
              placeholder="Nhập email đăng ký của bạn"
            />
            <button type="submit">Đăng ký</button>
          </form>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube" />
            </a>
            <a href="#" aria-label="TikTok">
              <i className="fab fa-tiktok" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          {[
            {
              title: "Công ty cổ phần Canifa",
              content: (
                <>
                  <p>
                    Số ĐKKD: 0107574310, ngày cấp: 23/09/2016, nơi cấp: Sở KHĐT
                    Hà Nội
                  </p>
                  <p>
                    Địa chỉ: Số 688 Đường Quang Trung, Phường La Khê, Hà Đông,
                    Hà Nội
                  </p>
                  <p>Email: hello@canifa.com</p>
                </>
              ),
            },
            {
              title: "Thương hiệu",
              content: (
                <ul>
                  <li>
                    <a href="#">Giới thiệu</a>
                  </li>
                  <li>
                    <a href="#">Tuyển dụng</a>
                  </li>
                  <li>
                    <a href="#">Hệ thống cửa hàng</a>
                  </li>
                </ul>
              ),
            },
            {
              title: "Hỗ trợ",
              content: (
                <ul>
                  <li>
                    <a href="#">Hỏi đáp</a>
                  </li>
                  <li>
                    <a href="#">Chính sách KH</a>
                  </li>
                  <li>
                    <a href="#">Chính sách vận chuyển</a>
                  </li>
                </ul>
              ),
            },
            {
              title: "Fanpage",
              content: (
                <img
                  src="https://photo.salekit.com/uploads/fchat_5b4872d13803896dd77125af/cach-tao-fanpage-facebook.jpg"
                  alt="QR Code"
                />
              ),
            },
          ].map((section, i) => (
            <div key={i} className="footer-section">
              <h4 onClick={() => toggleSection(section.title)}>
                {section.title}
                <span className="toggle">
                  {openSection === section.title ? "−" : "+"}
                </span>
              </h4>
              <div
                className="footer-content-toggle"
                style={{
                  display:
                    openSection === section.title || window.innerWidth > 768
                      ? "block"
                      : "none",
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
