"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Nên dùng Image của Next.js cho Logo

import "@/app/assets/css/header.css";
import MenuComponent from "../Menu";
import MiniCartComponent from "../MiniCart";
import AccountMenu from "../AccountMenu";
import { useAuth } from "@/app/context/CAuth";
import { useCart } from "../../../context/Ccart";
import { useMinicart } from "@/app/context/MinicartContext";

export default function Header() {
  const { toggle } = useMinicart();
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Tối ưu tính tổng số lượng giỏ hàng bằng useMemo
  const cartCount = useMemo(() => {
    return cart?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  }, [cart]);

  // 2. Logic điều hướng tập trung
  const handleGoShop = () => {
    const targetPath = user?.role === 2 ? "/page/shop/shop-infor" : "/page/shop/register";
    router.push(targetPath);
  };

  return (
    <>
      {/* 3. Phần Search Popup nên được tách thành component riêng nếu quá dài 
          Ở đây mình giữ nguyên cấu trúc nhưng làm gọn logic */}
      <SearchPopup />

      <header className="site-header position-appheader">
        <div className="header__container">
          
          {/* Logo Section */}
          <div className="header__logo">
            <Link
              href="/"
              className={`a-logo header__logo-link ${pathname === "/" ? "nuxt-link-active" : ""}`}
              title="Home Page"
            >
              <img
                src="https://i.ibb.co/R43sFs6q/Gemini-Generated-Image-o5qneto5qneto5qn.png"
                alt="FIYO"
                width={83}
                height={44}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Search Bar on Header */}
          <div className="header__search">
            <div className="header__icon header__icon-search">
              <span className="screen-reader-text">search</span>
            </div>
            <div className="header__search-form">
              <div className="header__search-btn">
                <span className="screen-reader-text">search</span>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="header__search-input"
              />
            </div>
          </div>

          {/* Action Icons Group */}
          <div className="header__group-icon">
            <button
              type="button"
              className="header__icon-store header__icon"
              aria-label="Khu vực shop"
              onClick={handleGoShop}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <span>Cửa hàng</span>
            </button>

            <div className="header__icon-account">
              <AccountMenu />
            </div>

            <div className="header__icon-cart header__icon" onClick={toggle} style={{ cursor: 'pointer' }}>
              <span>Giỏ hàng</span>
              {cartCount > 0 && (
                <div className="header__icon-count">{cartCount}</div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Side Components */}
      <MiniCartComponent />
      <MenuComponent />
    </>
  );
}

// Tách Search Popup ra để Header chính trông sạch sẽ hơn
function SearchPopup() {
  const suggestedKeywords = ["Áo phông", "Hoodie", "Áo khoác", "Váy"];

  return (
    <div className="search-content">
      <div className="search-popup">
        <div className="search-popup__top">
          <form className="search-popup__form" action="/search" method="get">
            <button type="submit" className="search-popup__form-btn">
              <span className="screen-reader-text">tìm kiếm</span>
            </button>
            <input
              type="text"
              name="query"
              placeholder="Tìm kiếm"
              className="search-popup__form-input"
            />
          </form>
          <button className="search-popup__close">
            <span className="screen-reader-text">close</span>
          </button>
        </div>
        <div className="search-popup__bottom">
          <div className="search-popup__suggested-heading">
            <h2 className="search-popup__suggested-title">Lịch sử tìm kiếm</h2>
            <div className="search-popup__suggested-remove">Xóa</div>
          </div>
          <div className="search-popup__suggested-content">
            <span className="search-popup__suggested-label">Abc</span>
          </div>
          <div className="search-popup__suggested-keywords">
            <div className="search-popup__suggested-heading">
              <h2 className="search-popup__suggested-title">Từ khóa nổi bật</h2>
            </div>
            <div className="search-popup__suggested-content">
              {suggestedKeywords.map((kw) => (
                <span key={kw} className="search-popup__suggested-label">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}