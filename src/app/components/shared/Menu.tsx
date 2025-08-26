"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  parentId?: string;
  images?: string[];
  type?: string | null;
  __v?: number;
};

const PARENTS_API = "https://fiyo.click/api/category/parents";
const CHILDREN_API = (parentId: string) =>
  `https://fiyo.click/api/category/children/${parentId}`;

const norm = (s?: string | null) => (s || "").toLowerCase().trim();

export default function MenuComponent() {
  const pathname = usePathname();

  const [parents, setParents] = useState<Category[]>([]);
  const [subs, setSubs] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [errorSubs, setErrorSubs] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // -------- Fetch parents once --------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(PARENTS_API, { cache: "no-store" });
        const data = await res.json();
        const list: Category[] = Array.isArray(data) ? data : data?.data ?? [];
        // ✅ Chỉ giữ những parent có slug hợp lệ
        const cleaned = list.filter((p) => !!p.slug && norm(p.slug) !== "undefined");
        if (mounted) setParents(cleaned);
        console.log("[parents]", cleaned);
      } catch (e) {
        console.error("Lỗi lấy danh mục cha:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // -------- Fetch subs when hover a parent --------
  useEffect(() => {
    if (!activeParent) {
      setSubs([]);
      setErrorSubs(null);
      return;
    }

    setLoadingSubs(true);
    setErrorSubs(null);

    // cancel request cũ (nếu có)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await fetch(CHILDREN_API(activeParent), {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        const list: Category[] = Array.isArray(data) ? data : data?.data ?? [];
        // ✅ Chỉ giữ subs có slug hợp lệ
        const cleanedSubs = list.filter((c) => !!c.slug && norm(c.slug) !== "undefined");
        setSubs(cleanedSubs);
        console.log(`[subs for ${activeParent}]`, cleanedSubs);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Lỗi lấy danh mục con:", e);
          setErrorSubs("Không lấy được danh mục con");
        }
      } finally {
        setLoadingSubs(false);
      }
    })();

    return () => controller.abort();
  }, [activeParent]);

  // -------- Derived lists --------
  const nonAccessories = useMemo(
    () => subs.filter((c) => norm(c.type) !== "accessory"),
    [subs]
  );
  const accessories = useMemo(
    () => subs.filter((c) => norm(c.type) === "accessory"),
    [subs]
  );

  const half = Math.ceil(nonAccessories.length / 2);

  return (
    <div className="menu">
      <ul className="menu__container">
        {/* Mục cố định đầu */}
        <li className="menu__item">
          <Link
            href="/page/product"
            className={`menu__item-link ${
              pathname === "/page/product" ? "nuxt-link-active" : ""
            }`}
          >
            <span>Tưng bừng hàng mới</span>
          </Link>
        </li>

        {/* Mục động từ API (đã lọc parent không có slug) */}
        {parents.map((parent) => (
          <li
            key={parent._id}
            className="menu__item has-children"
            onMouseEnter={() => setActiveParent(parent._id)}
            onMouseLeave={() =>
              setActiveParent((p) => (p === parent._id ? null : p))
            }
          >
            <Link
              href={`/page/categoryparent/${parent.slug}`}
              className={`menu__item-link ${
                pathname === `/page/categoryparent/${parent.slug}`
                  ? "nuxt-link-active"
                  : ""
              }`}
            >
              <span>{parent.name}</span>
            </Link>

            {/* Submenu */}
            <div
              className="menu__submenu"
              style={{
                display: activeParent === parent._id ? "block" : "none",
                visibility: activeParent === parent._id ? "visible" : "hidden",
                opacity: activeParent === parent._id ? 1 : 0,
              }}
            >
              <div className="menu__submenu-content">
                {/* Cột trái */}
                <div className="menu__submenu--left">
                  <ul>
                    <li>
                      <Link href="/page/product">Sản phẩm mới</Link>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <Link href="/page/sale">Giá tốt</Link>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <Link href="/page/sale" style={{ color: "rgb(218,41,28)" }}>
                        Siêu sale ngày đôi
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Cột giữa: Danh mục sản phẩm (loại accessory) */}
                <div className="menu__submenu--mid">
                  <div className="menu__submenu-cat">
                    <div className="menu__submenu-title">
                      <span>Danh mục sản phẩm</span>
                    </div>

                    {activeParent === parent._id && (
                      <div className="menu__submenu-cat-content">
                        {loadingSubs && <div style={{ padding: 8 }}>Đang tải…</div>}
                        {errorSubs && (
                          <div style={{ color: "red", padding: 8 }}>{errorSubs}</div>
                        )}

                        {!loadingSubs && !errorSubs && (
                          <>
                            <ul>
                              {nonAccessories.slice(0, half).map((child) => (
                                <li key={child._id}>
                                  <Link
                                    href={`/page/category/${parent.slug}/${child.slug}`}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>

                            <ul>
                              {nonAccessories.slice(half).map((child) => (
                                <li key={child._id}>
                                  <Link
                                    href={`/page/category/${parent.slug}/${child.slug}`}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột phải */}
                <div className="menu__submenu--right">
                  {/* PHỤ KIỆN */}
                  <div className="menu__submenu-cat">
                    <div className="menu__submenu-title">
                      <span>Phụ kiện</span>
                    </div>

                    {activeParent === parent._id && (
                      <div className="menu__submenu-cat-content">
                        {loadingSubs && <div style={{ padding: 8 }}>Đang tải…</div>}
                        {!loadingSubs && (
                          <ul>
                            {accessories.length > 0 ? (
                              accessories.map((child) => (
                                <li key={child._id}>
                                  <Link
                                    href={`/page/category/${parent.slug}/${child.slug}`}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))
                            ) : (
                              <li style={{ color: "#74869b" }}>Chưa có phụ kiện</li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GỢI Ý NHANH */}
                  <div className="menu__submenu-cat">
                    <div className="menu__submenu-title">
                      <span>Gợi ý nhanh</span>
                    </div>
                    <div className="menu__submenu-cat-content">
                      <ul>
                        <li>
                          <Link href="/page/product">Mới ra mắt</Link>
                        </li>
                        <li>
                          <Link href="/page/hot">Đang hot</Link>
                        </li>
                        <li>
                          <Link href="/page/199k">Giá dưới 199K</Link>
                        </li>
                        <li>
                          <Link href="/page/best-selling">Bán chạy nhất</Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* HÌNH ẢNH */}
                  <div className="menu__submenu-images">
                    <span className="images">
                      <img
                        width={203}
                        height={274}
                        src="https://media.canifa.com/mega_menu/item/Nu-1-menu-05Mar.webp"
                        alt="image"
                      />
                    </span>
                    <span className="images">
                      <img
                        width={203}
                        height={274}
                        src="https://media.canifa.com/mega_menu/item/Nu-1-menu-05Mar.webp"
                        alt="image"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* Mục cố định cuối */}
        <li className="menu__item">
          <Link
            href="/page/sale"
            className={`menu__item-link ${
              pathname === "/bst-em-oi-em-a" ? "nuxt-link-active" : ""
            }`}
          >
            <span>SIÊU SALE MÙA HÈ</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
