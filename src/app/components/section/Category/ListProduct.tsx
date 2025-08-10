"use client";
import { useEffect, useState, useRef } from "react";
import { ICategory } from "@/app/untils/ICategory";
import { IProduct } from "@/app/untils/IProduct";
import { getProductsByCategoryParent } from "@/app/services/SProduct";
import ProductList from "../../shared/ListProduct";
import { IFilter } from "@/app/untils/IFilter";

interface Props {
  categorybyslug: ICategory[];
  filters: IFilter;
  onFilterChange: (newFilters: IFilter) => void;
}

export default function ListProductCate({
  categorybyslug,
  filters,
  onFilterChange,
}: Props) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState("fade-in");
  const sorterRef = useRef<HTMLDivElement>(null);

  const parentCategoryId = categorybyslug[0]._id;
  const title = "Sản phẩm";
  const [sortOpen, setSortOpen] = useState(false);

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

  const selectedSort = reverseSortMap[filters.sort ?? "newest"] ?? "Mới nhất";

  
  const handleSortChange = (label: keyof typeof sortMap) => {
    const newSortValue = sortMap[label];
    const newFilters = { ...filters, sort: newSortValue };
    onFilterChange(newFilters);
    setSortOpen(false);
  };


  useEffect(() => {

    const fetchFilteredProducts = async () => {
      try {
        setFadeClass("fade-out");
        setLoading(true);

        const allProducts = await getProductsByCategoryParent(parentCategoryId);

        const response = await fetch("https://fiyo.click/api/products/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: allProducts, filters }),
        });

        const data = await response.json();

        setTimeout(() => {
          if (data.status) {
            setProducts(data.data);
          } else {
            setProducts([]);
            console.error("Lọc thất bại:", data.message);
          }
          setFadeClass("fade-in");
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error("Lỗi khi lọc sản phẩm:", err);
        setProducts([]);
        setFadeClass("fade-in");
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filters, categorybyslug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sorterRef.current &&
        !sorterRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="columns__main">
      <div className="toolbar toolbar-products">
        <div className="toolbar-amount">
          <span>
            {loading
              ? "Đang tải sản phẩm..."
              : `Tổng số ${products.length} sản phẩm`}
          </span>
        </div>

        <div
          className={`toolbar-sorter ${sortOpen ? "active" : ""}`}
          ref={sorterRef}
        >
          <div
            className="toolbar-sorter__action"
            onClick={() => setSortOpen((prev) => !prev)}
          >
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
          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : (
            <ProductList  products ={products} />
          )}
        </div>
      </div>

      {!loading && (
        <div className="toolbar-loadmore">
          <button className="toolbar-loadmore__button">Xem thêm</button>
          <div className="toolbar-loadmore__text">
            Hiển thị <span>{products.length}</span> trên tổng số {" "}
            <span>{products.length}</span> sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}