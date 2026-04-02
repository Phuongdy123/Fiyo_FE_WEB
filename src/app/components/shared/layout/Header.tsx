"use client";
import "@/app/assets/css/header.css";
import MenuComponent from "../Menu";
import { useRouter, usePathname } from "next/navigation"; // Thêm usePathname
import { useAuth } from "@/app/context/CAuth";
import MiniCartComponent from "../MiniCart";
import { useCart } from "../../../context/Ccart";
import { useMinicart } from "@/app/context/MinicartContext";
import Link from "next/link"; // Thêm import Link
import AccountMenu from "../AccountMenu";


export default function Header() {
  
  
  const { toggle } = useMinicart();
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const handleGoShop = () => {
    if (user?.role === 2) {
      router.push("/page/shop/shop-infor");
    } else {
      router.push("/page/shop/register");
    }
  };

  const handleClick = () => {
    if (user) {
      router.push("/page/account");
    } else {
      router.push("/page/login");
    }
  };

  return (
    <>
      <div>
        <div className="search-content">
          <div className="search-popup">
            <div className="search-popup__top">
              <form
                className="search-popup__form"
                action="search.html"
                method="get"
              >
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
                <h2 className="search-popup__suggested-title">
                  Lịch sử tìm kiếm
                </h2>
                <div className="search-popup__suggested-remove">Xóa</div>
              </div>
              <div className="search-popup__suggested-content">
                <span className="search-popup__suggested-label">Abc</span>
              </div>
              <div className="search-popup__suggested-keywords">
                <div className="search-popup__suggested-heading">
                  <h2 className="search-popup__suggested-title">
                    Từ khóa nổi bật
                  </h2>
                </div>
                <div className="search-popup__suggested-content">
                  <span className="search-popup__suggested-label">
                    Áo phông
                  </span>
                  <span className="search-popup__suggested-label">Hoodie</span>
                  <span className="search-popup__suggested-label">
                    Áo khoác
                  </span>
                  <span className="search-popup__suggested-label">Váy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <header className="site-header position-appheader">
          <div className="header__container">
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
    />
  </Link>
</div>
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
            <div className="search-popup">
              <div className="search-popup__top">
                <div className="search-popup__form">
                  <button className="search-popup__form-btn">
                    <span className="screen-reader-text">search</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    id="search-popup__form-input"
                    className="search-popup__form-input"
                  />
                </div>
                <button className="search-popup__close">
                  <span className="screen-reader-text">close</span>
                </button>
              </div>
              <div className="search-popup__bottom">
                <div className="search-popup__history">
                  <div className="search-popup__suggested-heading">
                    <h2 className="search-popup__suggested-title">
                      Lịch sử tìm kiếm
                    </h2>
                    <div className="search-popup__suggested-remove">Xóa</div>
                  </div>
                  <div className="search-popup__suggested-content">
                    <span className="search-popup__suggested-label"> a</span>
                    <span className="search-popup__suggested-label"> 123</span>
                    <span className="search-popup__suggested-label"> h</span>
                  </div>
                </div>
                <div className="search-popup__suggested-keywords">
                  <div className="search-popup__suggested-heading">
                    <h2 className="search-popup__suggested-title">
                      Từ khóa nổi bật
                    </h2>
                  </div>
                  <div className="search-popup__suggested-content">
                    <span className="search-popup__suggested-label">
                      {" "}
                      Áo phông{" "}
                    </span>
                    <span className="search-popup__suggested-label">
                      Hoddie{" "}
                    </span>
                    <span className="search-popup__suggested-label">
                      {" "}
                      Áo khoác{" "}
                    </span>
                    <span className="search-popup__suggested-label">
                      6LB22W001{" "}
                    </span>
                  </div>
                </div>
                <div className="search-popup__suggested--product" />
              </div>
            </div>
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
  <AccountMenu />  {/* Popup tài khoản */}
</div>
              <div className="header__icon-cart header__icon" onClick={toggle}>
                <span>Giỏ hàng</span>
                <div className="header__icon-count">
                  {cart?.reduce(
                    (total, item) => total + (item.quantity || 0),
                    0
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <MiniCartComponent />
      
        <MenuComponent />
      </div>
    </>
  );
}