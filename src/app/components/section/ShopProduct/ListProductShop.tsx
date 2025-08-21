// /components/shop/ListProductShop.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { IProduct } from "@/app/untils/IProduct";
import type { IFilter } from "@/app/untils/IFilter";
import ProductList from "../../shared/ListProduct";

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

export default function ListProductShop({
  shopId,
  filters,
  onFilterChange,
}: {
  shopId: string;
  filters: IFilter;
  onFilterChange: (next: IFilter) => void;
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState("fade-in");

  const [sortOpen, setSortOpen] = useState(false);
  const sorterRef = useRef<HTMLDivElement>(null);

  const selectedSort = reverseSortMap[filters.sort ?? "newest"] ?? "Mới nhất";

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

        // 1) Lấy toàn bộ sản phẩm thuộc shop
        const res = await fetch(`http://localhost:3000/api/products/shop/${shopId}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const shopData = await res.json();
        const allProducts: IProduct[] = Array.isArray(shopData?.products) ? shopData.products : [];

        // 2) Lọc ở server qua endpoint filter
        const response = await fetch("http://localhost:3000/api/products/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: allProducts, filters }),
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
        }, 200);
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

  // ẩn sản phẩm bị isHidden
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
            {loading ? "Đang tải sản phẩm..." : `Tổng số ${visibleProducts.length} sản phẩm`}
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
