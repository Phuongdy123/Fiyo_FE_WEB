"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "@/app/assets/css/product-page.css";
import ProductList from "../../components/shared/ListProduct";
import PageNavComponents from "../../components/shared/PageNav";
import { IProduct } from "@/app/untils/IProduct";
import { IFilter } from "@/app/untils/IFilter";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [filter, setFilter] = useState<IFilter>({
    size: null,
    color: null,
    minPrice: null,
    maxPrice: null,
    sort: "newest",
  });

  const isFilterActive = (filters: IFilter): boolean => {
    return (
      filters.color !== null ||
      filters.size !== null ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.sort !== "newest"
    );
  };

  const [openPrice, setOpenPrice] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const adultSizes = ["S", "M", "L", "XL", "XXL"];

  const applyFilters = async (data: IProduct[]) => {
    let list = [...data];

    // Lọc hidden
    list = list.filter((p) => p.isHidden === false || p.isHidden === undefined);

    // Lọc qua API filter nếu có filter đang bật
    if (isFilterActive(filter)) {
      const filterRes = await fetch("https://fiyo.click/api/products/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: list, filters: filter }),
      });
      const filterData = await filterRes.json();
      list = filterData.status ? filterData.data : [];
    }

    return list;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://fiyo.click/api/products/search?name=${keyword}`
      );
      const data = await res.json();

      const filteredList = await applyFilters(data);

      setAllProducts(filteredList);
      setTotalPages(Math.ceil(filteredList.length / limit));
      setCurrentPage(1); // reset về trang 1 khi tìm mới
    } catch (err) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", err);
    }
  };

  useEffect(() => {
    if (keyword) {
      fetchData();
    }
  }, [keyword, filter]);

  if (!keyword) return <p>Không có từ khóa tìm kiếm.</p>;

  // Tính sản phẩm của trang hiện tại
  const indexOfLast = currentPage * limit;
  const indexOfFirst = indexOfLast - limit;
  const currentProducts = allProducts.slice(indexOfFirst, indexOfLast);

  return (
    <div className="main-content">
      <div className="breadcrumbs">
        <ul className="items">
          <li className="item"><a href="#">Trang chủ</a></li>
          <li className="item"><a href="#">Tìm kiếm</a></li>
          <li className="item"><strong>Từ khóa {keyword}</strong></li>
        </ul>
      </div>

     <span className="dropdown-title">
  Kết quả cho <strong>"{keyword}"</strong> — Tổng số{" "}
  <strong>{allProducts.length}</strong> sản phẩm
</span>

      {/* Filter */}
      <div className="filter-container" style={{ marginTop: "2vw" }}>
        <div className="filter-label"><span>BỘ LỌC:</span></div>

        <div className="filter-dropdown">
          {/* Dropdown Giá */}
          <div className="dropdown">
            <button className="filter-button" onClick={() => setOpenPrice(!openPrice)}>
              <span className="dropdown-title">Khoảng giá</span>
              <span className="dropdown-icon">▼</span>
            </button>
            {openPrice && (
              <ul className="dropdown-menu show">
                <li onClick={() => { setFilter({ ...filter, minPrice: 0, maxPrice: 100000 }); setOpenPrice(false); }}>
                  Giá dưới 100.000đ
                </li>
                <li onClick={() => { setFilter({ ...filter, minPrice: 100000, maxPrice: 200000 }); setOpenPrice(false); }}>
                  100.000đ - 200.000đ
                </li>
                <li onClick={() => { setFilter({ ...filter, minPrice: 200000, maxPrice: 300000 }); setOpenPrice(false); }}>
                  200.000đ - 300.000đ
                </li>
                <li onClick={() => { setFilter({ ...filter, minPrice: 300000, maxPrice: 400000 }); setOpenPrice(false); }}>
                  300.000đ - 400.000đ
                </li>
                <li onClick={() => { setFilter({ ...filter, minPrice: 500000, maxPrice: null }); setOpenPrice(false); }}>
                  Giá trên 500.000đ
                </li>
              </ul>
            )}
          </div>

          {/* Dropdown Kích cỡ */}
          <div className="dropdown">
            <button className="filter-button" onClick={() => setOpenSize(!openSize)}>
              <span className="dropdown-title">Kích cỡ</span>
              <span className="dropdown-icon">▼</span>
            </button>
            {openSize && (
              <ul className="dropdown-menu show">
                {adultSizes.map((size) => (
                  <li key={size} onClick={() => { setFilter({ ...filter, size }); setOpenSize(false); }}>
                    {size}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dropdown Sort */}
        <div className="sort-option dropdown">
          <button className="filter-button sort-link" onClick={() => setOpenSort(!openSort)}>
            <span className="dropdown-title">Sắp xếp theo</span>
            <span className="dropdown-icon">▼</span>
          </button>
          {openSort && (
            <ul className="dropdown-menu show">
              <li onClick={() => { setFilter({ ...filter, sort: "price_asc" }); setOpenSort(false); }}>
                Theo giá tăng dần
              </li>
              <li onClick={() => { setFilter({ ...filter, sort: "price_desc" }); setOpenSort(false); }}>
                Theo giá giảm dần
              </li>
              <li onClick={() => { setFilter({ ...filter, sort: "newest" }); setOpenSort(false); }}>
                Mới nhất
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="products-grid">
        {currentProducts.length === 0 ? (
          <p style={{ fontSize: 16, padding: "2rem", color: "gray" }}>
            Không tìm thấy sản phẩm phù hợp với từ khóa "
            <strong>{keyword}</strong>"
          </p>
        ) : (
          <div className="product-items-new">
            <ProductList products={currentProducts} />
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PageNavComponents
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Đang tải kết quả...</div>}>
      <SearchContent />
    </Suspense>
  );
}
