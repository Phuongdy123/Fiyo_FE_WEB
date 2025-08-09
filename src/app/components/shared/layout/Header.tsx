"use client";
import "@/app/assets/css/header.css";
import MenuComponent from "../Menu";
import { useRouter, usePathname } from "next/navigation"; // Thêm usePathname
import { useAuth } from "@/app/context/CAuth";
import MiniCartComponent from "../MiniCart";
import { useCart } from "../../../context/Ccart";
import { useMinicart } from "@/app/context/MinicartContext";
import Link from "next/link"; // Thêm import Link

export default function Header() {
  const { toggle } = useMinicart();
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

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
                <svg
                  width={83}
                  height={44}
                  viewBox="0 0 83 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M46.5503 30.4271V13.5729H48.8924V30.4271H46.5503ZM34.6931 30.4271V13.5729C36.3033 13.5729 37.9136 13.5729 39.5238 13.5729C41.5732 13.5729 43.1834 15.2136 43.1834 17.3017V30.4271H40.9877V17.3017C40.9877 16.5559 40.4021 15.8102 39.5238 15.8102C38.6455 15.8102 37.9136 15.8102 37.0353 15.8102V30.4271H34.6931ZM16.9806 30.4271C14.9312 30.4271 13.321 28.7864 13.321 26.6983V17.4508C13.321 15.3627 14.9312 13.722 16.9806 13.722H20.3474V16.1085H16.9806C16.2487 16.1085 15.5168 16.7051 15.5168 17.6V26.8475C15.5168 27.5932 16.1023 28.339 16.9806 28.339H20.3474V30.4333H16.9609L16.9806 30.4271ZM29.1305 21.9254V17.3017C29.1305 16.5559 28.545 15.8102 27.6667 15.8102H26.642C25.9101 15.8102 25.1781 16.4068 25.1781 17.3017V21.9254H29.1305ZM67.3369 24.3119H63.3845V30.4271H61.0423V17.3017C61.0423 15.2136 62.6526 13.5729 64.7019 13.5729H65.7266C67.776 13.5729 69.3862 15.2136 69.3862 17.3017V30.4271H67.3369V24.3119ZM63.5309 21.9254H67.3369V17.3017C67.3369 16.5559 66.7513 15.8102 65.873 15.8102H64.8483C64.1164 15.8102 63.3845 16.4068 63.3845 17.3017V21.9254H63.5309ZM54.6014 21.9254H58.7002V24.3119H54.6014V30.4271H52.2593V24.3119V21.9254V17.3017C52.2593 15.2136 53.8695 13.5729 55.9189 13.5729H58.7002V15.9593H55.9189C55.1869 15.9593 54.455 16.5559 54.455 17.4508V21.9254H54.6014ZM22.836 30.4271V17.3017C22.836 15.2136 24.4462 13.5729 26.4956 13.5729H27.5203C29.5697 13.5729 31.1799 15.2136 31.1799 17.3017V30.4271H28.8377V24.3119H24.8854V30.4271H22.836ZM0 0H83V44H0V0Z"
                    fill="#E2231A"
                  />
                </svg>
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
              <Link
                href="#"
                className={`header__icon-store header__icon`}
                aria-label="Hệ thống cửa hàng"
              >
                <span>Cửa hàng</span>
              </Link>
              <Link
                href={user ? "/page/account" : "/page/login"}
                className={`header__icon-account--group ${
                  pathname === (user ? "/page/account" : "/page/login") ? "nuxt-link-active" : ""
                }`}
              >
                <div
                  className="header__icon-account header__icon-account--mobile header__icon"
                  style={{ cursor: "pointer" }}
                >
                  <span>Tài khoản</span>
                </div>
              </Link>
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