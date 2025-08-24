"use client";
import { useEffect, useRef, useState } from "react";
import type { IProduct } from "@/app/untils/IProduct";
import type { IFilter } from "@/app/untils/IFilter";
import ProductList from "../../shared/ListProduct";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";
const API_PRODUCTS_BASE = `${API_BASE}/api/products`;
const API_PRODUCTS_BY_SHOP = (shopId: string) => `${API_PRODUCTS_BASE}/shop/${shopId}`;
const API_PRODUCTS_BY_SHOP_AND_CATEGORY = (shopId: string, categoryId: string) =>
  `${API_PRODUCTS_BASE}/shop/${shopId}/category/${categoryId}`;
const API_FILTER = `${API_PRODUCTS_BASE}/filter`;

const sortMap = {
  "Mới nhất": "newest",
  "Giá: thấp đến cao": "price_asc",
  "Giá: cao đến thấp": "price_desc",
} as const;

const reverseSortMap = {
  newest: "Mới nhất",
  price_asc: "Giá: thấp đến cao",
  price_desc: "Giá: cao đến thấp",
} as const;

type SortKey = keyof typeof reverseSortMap; // "newest" | "price_asc" | "price_desc"

export default function ListProductShop({
  shopId,
  filters,
  onFilterChange,
}: {
  shopId: string;
  filters: IFilter & { categoryId?: string | null };
  onFilterChange: (next: IFilter & { categoryId?: string | null }) => void;
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState("fade-in");

  const [sortOpen, setSortOpen] = useState(false);
  const sorterRef = useRef<HTMLDivElement>(null);

  // ✅ đảm bảo filters.sort là SortKey
  const sortKey: SortKey = (filters.sort as SortKey) || "newest";
  const selectedSort = reverseSortMap[sortKey];

  const handleSortChange = (label: keyof typeof sortMap) => {
    onFilterChange({ ...filters, sort: sortMap[label] });
    setSortOpen(false);
  };

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        setFadeClass("fade-out");
        setLoading(true);

        // 1) Lấy sản phẩm theo shop (và category nếu có)
        let sourceProducts: IProduct[] = [];

        if (filters.categoryId) {
          const res = await fetch(
            API_PRODUCTS_BY_SHOP_AND_CATEGORY(shopId, String(filters.categoryId)),
            { cache: "no-store", signal: ac.signal }
          );
          const payload = await res.json();
          sourceProducts = Array.isArray(payload) ? payload : payload?.products ?? [];
        } else {
          const res = await fetch(API_PRODUCTS_BY_SHOP(shopId), {
            cache: "no-store",
            signal: ac.signal,
          });
          const payload = await res.json();
          sourceProducts = Array.isArray(payload?.products) ? payload.products : [];
        }

        // 2) Lọc ở server qua endpoint filter
        const response = await fetch(API_FILTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: sourceProducts, filters }),
          signal: ac.signal,
        });
        const data = await response.json();

        setTimeout(() => {
          if (data.status) {
            setProducts(Array.isArray(data.data) ? data.data : []);
          } else {
            console.error("Lọc thất bại:", data.message);
            setProducts([]);
          }
          setFadeClass("fade-in");
          setLoading(false);
        }, 150);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("Lỗi khi tải/lọc sản phẩm shop:", err);
          setProducts([]);
          setFadeClass("fade-in");
          setLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [shopId, filters]);

  const visibleProducts = products.filter((p) => p.isHidden !== true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sorterRef.current && !sorterRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="columns__main">
      <div className="toolbar toolbar-products">
        <div className="toolbar-amount">
          <span>
            {loading ? "Đang tải sản phẩm..." : `Tất cả sản phẩm`}
          </span>
        </div>

        <div className={`toolbar-sorter ${sortOpen ? "active" : ""}`} ref={sorterRef}>
          <div className="toolbar-sorter__action" onClick={() => setSortOpen((prev) => !prev)}>
            <strong>{selectedSort}</strong>
          </div>

          <div className="toolbar-sorter__content">
            <ul>
              {Object.keys(sortMap).map((label) => (
                <li
                  key={label}
                  className={selectedSort === label ? "active" : ""}
                  onClick={() => handleSortChange(label as keyof typeof sortMap)}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="products-grid">
        <div className={`product-items-new-cate ${fadeClass}`}>
          {loading ? <p>Đang tải sản phẩm...</p> : <ProductList products={visibleProducts} />}
        </div>
      </div>

      {!loading && (
        <div className="toolbar-loadmore">
          <button className="toolbar-loadmore__button">Xem thêm</button>
          <div className="toolbar-loadmore__text">
            Hiển thị <span>{visibleProducts.length}</span> trên tổng số{" "}
            <span>{visibleProducts.length}</span> sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}
