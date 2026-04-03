"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  type?: string | null;
};

const PARENTS_API = "https://fiyo-be.onrender.com/api/category/parents";
const CHILDREN_API = (parentId: string) => `https://fiyo-be.onrender.com/api/category/children/${parentId}`;

const norm = (s?: string | null) => (s || "").toLowerCase().trim();

export default function MenuComponent() {
  const pathname = usePathname();
  const [parents, setParents] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  
  // 1. Dùng Map để Cache danh mục con, tránh fetch lại khi người dùng hover qua lại
  const [subsCache, setSubsCache] = useState<Record<string, Category[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // -------- Fetch Parents (Chạy 1 lần duy nhất) --------
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch(PARENTS_API, { next: { revalidate: 3600 } }); // Cache 1 giờ
        const data = await res.json();
        const list: Category[] = Array.isArray(data) ? data : data?.data ?? [];
        setParents(list.filter((p) => p.slug && norm(p.slug) !== "undefined"));
      } catch (e) {
        console.error("Menu: Lỗi tải danh mục cha", e);
      }
    };
    fetchParents();
  }, []);

  // -------- Logic Fetch Subs với Caching --------
  const handleMouseEnter = useCallback(async (parentId: string) => {
    setActiveParent(parentId);

    // Nếu đã có trong cache thì không fetch nữa
    if (subsCache[parentId]) return;

    setLoadingId(parentId);
    try {
      const res = await fetch(CHILDREN_API(parentId));
      const data = await res.json();
      const list: Category[] = Array.isArray(data) ? data : data?.data ?? [];
      const cleaned = list.filter((c) => c.slug && norm(c.slug) !== "undefined");
      
      setSubsCache(prev => ({ ...prev, [parentId]: cleaned }));
    } catch (e) {
      console.error("Menu: Lỗi tải danh mục con", e);
    } finally {
      setLoadingId(null);
    }
  }, [subsCache]);

  // -------- Tối ưu lọc danh mục (Memoized) --------
  const currentSubs = useMemo(() => (activeParent ? subsCache[activeParent] || [] : []), [activeParent, subsCache]);
  
  const { nonAccessories, accessories } = useMemo(() => {
    return {
      nonAccessories: currentSubs.filter(c => norm(c.type) !== "accessory"),
      accessories: currentSubs.filter(c => norm(c.type) === "accessory")
    };
  }, [currentSubs]);

  return (
    <nav className="menu">
      <ul className="menu__container">
        {/* Hàng mới */}
        <li className="menu__item">
          <MenuLink href="/page/product" active={pathname === "/page/product"}>Tưng bừng hàng mới</MenuLink>
        </li>

        {/* Categories động */}
        {parents.map((parent) => (
          <li
            key={parent._id}
            className="menu__item has-children"
            onMouseEnter={() => handleMouseEnter(parent._id)}
            onMouseLeave={() => setActiveParent(null)}
          >
            <MenuLink 
              href={`/page/categoryparent/${parent.slug}`} 
              active={pathname.includes(parent.slug!)}
            >
              {parent.name}
            </MenuLink>

            {/* Megamenu Submenu */}
            <div className={`menu__submenu ${activeParent === parent._id ? "is-active" : ""}`}>
              <div className="menu__submenu-content">
                {/* Cột trái: Tĩnh */}
                <div className="menu__submenu--left">
                   <ul className="quick-links">
                     <li><Link href="/page/product">Sản phẩm mới</Link></li>
                     <li><Link href="/page/sale">Giá tốt</Link></li>
                     <li><Link href="/page/sale" style={{ color: "#da291c" }}>Siêu sale ngày đôi</Link></li>
                   </ul>
                </div>

                {/* Cột giữa: Danh mục (Phân 2 cột) */}
                <div className="menu__submenu--mid">
                  <div className="menu__submenu-title">Danh mục sản phẩm</div>
                  {loadingId === parent._id ? <div className="loader">Đang tải...</div> : (
                    <div className="menu__submenu-grid">
                       <SubList items={nonAccessories.slice(0, Math.ceil(nonAccessories.length / 2))} parentSlug={parent.slug!} />
                       <SubList items={nonAccessories.slice(Math.ceil(nonAccessories.length / 2))} parentSlug={parent.slug!} />
                    </div>
                  )}
                </div>

                {/* Cột phải: Phụ kiện & Ảnh */}
                <div className="menu__submenu--right">
                  <div className="menu__submenu-title">Phụ kiện</div>
                  <SubList items={accessories} parentSlug={parent.slug!} emptyLabel="Chưa có phụ kiện" />
                  
                  <div className="menu__submenu-images">
                    <img src="https://media.canifa.com/mega_menu/item/Nu-1-menu-05Mar.webp" alt="Promo" width={203} height={274} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* Siêu sale */}
        <li className="menu__item">
          <MenuLink href="/page/sale" active={pathname === "/page/sale"}>SIÊU SALE MÙA HÈ</MenuLink>
        </li>
      </ul>
    </nav>
  );
}

// -------- Sub-components để sạch code --------

function MenuLink({ href, active, children }: any) {
  return (
    <Link href={href} className={`menu__item-link ${active ? "nuxt-link-active" : ""}`}>
      <span>{children}</span>
    </Link>
  );
}

function SubList({ items, parentSlug, emptyLabel }: any) {
  if (items.length === 0 && emptyLabel) return <p className="empty-msg">{emptyLabel}</p>;
  return (
    <ul>
      {items.map((item: any) => (
        <li key={item._id}>
          <Link href={`/page/category/${parentSlug}/${item.slug}`}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}