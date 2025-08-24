"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/CAuth";
import { useRouter, usePathname } from "next/navigation";

export default function AccountMenu() {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const go = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <div
      className={`header__icon-account--group ${
        pathname === (user ? "/page/account" : "/page/login")
          ? "nuxt-link-active"
          : ""
      }`}
      ref={ref}
    >
      {/* Nút bấm hiển thị giống hệt <Link> cũ */}
      <div
        className="header__icon-account header__icon-account--mobile header__icon"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <span>Tài khoản</span>
      </div>

      {/* Popup xổ xuống */}
      {open && (
        <div className="accm__popup">
          {!user ? (
            <>
              <a onClick={() => go("/page/login")} className="accm__item">
                <i className="fas fa-sign-in-alt"></i> Đăng nhập
              </a>
              <a onClick={() => go("/page/register")} className="accm__item">
                <i className="fas fa-user-plus"></i> Đăng ký
              </a>
            </>
          ) : (
            <>
              <a onClick={() => go("/page/account")} className="accm__item">
                <i className="far fa-user"></i> Quản lý tài khoản
              </a>

              {user.role === 2 && (
                <>
                  <a onClick={() => go("/page/shop/shop-infor")} className="accm__item">
                    <i className="fas fa-store"></i> Cửa hàng của bạn
                  </a>
                  <a onClick={() => go("/admin/shop")} className="accm__item">
                    <i className="fas fa-sitemap"></i> Quản trị Shop
                  </a>
                </>
              )}

              {user.role === 0 && (
                <a onClick={() => go("/admin")} className="accm__item">
                  <i className="fas fa-shield-alt"></i> Quản trị Admin
                </a>
              )}

              <div className="accm__divider" />

              <a
                onClick={() => {
                  logoutUser();
                  go("/page/login");
                }}
                className="accm__item danger"
              >
                <i className="fas fa-sign-out-alt"></i> Đăng xuất
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
