"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { IProduct } from "@/app/untils/IProduct";
import type { IFilter } from "@/app/untils/IFilter";
import ProductList from "../../shared/ListProduct";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";
const API_PRODUCTS_BASE = `${API_BASE}/api/products`;
const API_PRODUCTS_BY_SHOP = (shopId: string, ts: number) =>
  `${API_PRODUCTS_BASE}/shop/${shopId}?_ts=${ts}`;
const API_PRODUCTS_BY_SHOP_AND_CATEGORY = (shopId: string, categoryId: string, ts: number) =>
  `${API_PRODUCTS_BASE}/shop/${shopId}/category/${categoryId}?_ts=${ts}`;
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

type SortKey = keyof typeof reverseSortMap;

/** Chuẩn hoá mọi kiểu payload có thể có từ API */
function normalizeProducts(payload: any): IProduct[] {
  try {
    // Case A: [{status:true}, ...items]
    if (Array.isArray(payload) && payload.length > 0 && payload[0]?.status === true) {
      return payload.slice(1) as IProduct[];
    }
    // Case B: { products: [...] }
    if (Array.isArray(payload?.products)) return payload.products as IProduct[];
    // Case C: { data: [...] } hoặc { data: { products: [...] } }
    if (Array.isArray(payload?.data)) return payload.data as IProduct[];
    if (Array.isArray(payload?.data?.products)) return payload.data.products as IProduct[];
    // Case D: API trả thẳng mảng item
    if (Array.isArray(payload)) return payload as IProduct[];
  } catch {
    // ignore
  }
  return [];
}

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

  const sortKey: SortKey = (filters.sort as SortKey) || "newest";
  const selectedSort = reverseSortMap[sortKey];

  const handleSortChange = (label: keyof typeof sortMap) => {
    onFilterChange({ ...filters, sort: sortMap[label] });
    setSortOpen(false);
  };

  const fetchAndFilter = useCallback(async (signal?: AbortSignal) => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const ts = Date.now(); // cache-buster
    setFadeClass("fade-out");
    setLoading(true);
    try {
      let sourceProducts: IProduct[] = [];

      // 1) Lấy sản phẩm theo shop (và category nếu có)
      if (filters.categoryId) {
        const res = await fetch(
          API_PRODUCTS_BY_SHOP_AND_CATEGORY(shopId, String(filters.categoryId), ts),
          { cache: "no-store", signal }
        );
        const payload = await res.json();
        sourceProducts = normalizeProducts(payload);
      } else {
        const res = await fetch(API_PRODUCTS_BY_SHOP(shopId, ts), {
          cache: "no-store",
          signal,
        });
        const payload = await res.json();
        sourceProducts = normalizeProducts(payload);
      }

      // 2) Lọc ở server qua endpoint filter (nếu bạn cần giữ logic lọc BE)
      const response = await fetch(`${API_FILTER}?_ts=${ts}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: sourceProducts, filters }),
        signal,
      });
      const data = await response.json();

      setTimeout(() => {
        if (data?.status) {
          setProducts(Array.isArray(data.data) ? data.data : normalizeProducts(data));
        } else {
          // fallback: nếu filter BE fail thì dùng danh sách thô
          setProducts(sourceProducts);
          console.warn("Filter API trả về status=false, dùng danh sách gốc.");
        }
        setFadeClass("fade-in");
        setLoading(false);
      }, 120);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Lỗi khi tải/lọc sản phẩm shop:", err);
        setProducts([]);
        setFadeClass("fade-in");
        setLoading(false);
      }
    }
  }, [shopId, filters]);

  // Re-fetch khi shopId/filters đổi
  useEffect(() => {
    const ac = new AbortController();
    fetchAndFilter(ac.signal);
    return () => ac.abort();
  }, [fetchAndFilter]);

  // Re-fetch khi tab lấy lại focus (thêm sp mới ở nơi khác -> quay lại tab sẽ cập nhật)
  useEffect(() => {
    const onFocus = () => fetchAndFilter();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchAndFilter]);

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
          <button
            className="toolbar-loadmore__button"
            onClick={() => fetchAndFilter()} // cho nút "Xem thêm" cũng trigger refresh
          >
            Xem thêm
          </button>
          <div className="toolbar-loadmore__text">
            Hiển thị <span>{visibleProducts.length}</span> trên tổng số{" "}
            <span>{visibleProducts.length}</span> sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}
