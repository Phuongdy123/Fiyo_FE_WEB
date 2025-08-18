"use client";
import { useState, useEffect } from "react";
import { getAllCategory } from "@/app/services/Category/SCategory";
import {
  getAllSaleProduct,
  getProductsByCategoryParent,
  getSaleProductsByCategoryParent,
} from "@/app/services/SProduct";
import { ICategory } from "@/app/untils/ICategory";
import { IProduct } from "@/app/untils/IProduct";
import FilterEffectJS from '../../../assets/js/filter';
import ProductList from "../../shared/ListProduct";
import PageNavComponents from "../../shared/PageNav";
import { IFilter } from "@/app/untils/IFilter";

export default function ProductSection() {
  let title = "hahaha";
  const [sizeOpen, setSizeOpen] = useState(false);
  // phân loain size
  const adultSizes = ["S", "M", "L", "XL", "XXL"];
  const kidSizes = ["98", "104", "110", " 116", "122", "128","134","140"
   

  ];

  const [filter, setFilter] = useState<IFilter>({
    size: null,
    color: null,
    minPrice: null,
    maxPrice: null,
    sort: "newest",
  });
  // hàm check hd

  const isFilterActive = (filters: IFilter): boolean => {
    return (
      filters.color !== null ||
      filters.size !== null ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.sort !== "newest"
    );
  };
  
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategory] = useState<ICategory[]>([]);

  const fetchProducts = async () => {
  try {
    setProducts([]); // ⚠️ Reset danh sách sản phẩm trước mỗi lần fetch

    const allProducts = activeCategory
      ? await getSaleProductsByCategoryParent(activeCategory)
      : await getAllSaleProduct("http://localhost:3000/api/products");

    if (isFilterActive(filter)) {
      const response = await fetch("http://localhost:3000/api/products/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: allProducts, filters: filter }),
      });

      const data = await response.json();

      if (data.status) {
        setProducts(data.data);
      } else {
        setProducts([]); // fallback nếu lỗi
        console.error("Lọc thất bại:", data.message);
      }
    } else {
      setProducts(allProducts);
    }
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
  }
};

  // Khi thay đổi filter hoặc category => lọc lại
  useEffect(() => {
    fetchProducts();
  }, [filter, activeCategory]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await getAllCategory("http://localhost:3000/api/category/parents");
        const validCategories = category.filter((item: any) => item._id);
        setCategory(validCategories);
      } catch (error) {
        console.log("Lỗi khi lấy danh mục cha:", error);
      }
    };
    fetchCategory();
    
  }, []);

const handleCategoryClick = (categoryId: string | null) => {
  setProducts([]); // reset khi click danh mục
  setActiveCategory(categoryId);
};
  
const getSizeOptions = () => {
  const category = categories.find((c) => c._id === activeCategory);
  if (!category) return [...adultSizes, ...kidSizes]; // Nếu là "TẤT CẢ"

  const name = category.name?.trim().toLowerCase(); // ⚠️ THÊM `.trim()` để loại bỏ khoảng trắng thừa

  if (name === "nam" || name === "nữ") return adultSizes;
  if (name === "bé gái" || name === "bé trai") return kidSizes;

  return [];
};



  return (
    <>
      <div>
        <div className="banner">
          <img src="https://2885371169.e.cdneverest.net/pub/media/Simiconnector/spmoi_cate_desktop-220425.webp" />
        </div>

        <div className="main-content">
          {/* --- Danh mục --- */}
          <div className="categories">
            <div
              className={`category-item ${activeCategory === null ? "active" : ""}`}
              onClick={() => handleCategoryClick(null)}
            >
              TẤT CẢ
            </div>
            {categories.map((cate) => (
              <div
                key={cate._id}
                className={`category-item ${activeCategory === cate._id ? "active" : ""}`}
                onClick={() => handleCategoryClick(cate._id)}
              >
                {cate.name}
              </div>
            ))}
          </div>

          {/* --- Bộ lọc --- */}
          <div className="filter-container">
            <div className="filter-label">
              <span>BỘ LỌC:</span>
            </div>
            <div className="filter-dropdown">
              {/* Dropdown giá */}
              <div className="dropdown">
                <button className="filter-button">
                  <span className="dropdown-title">Khoảng giá</span>
                  <span className="dropdown-icon">▼</span>
                </button>
                <ul className="dropdown-menu">
                  <li onClick={() => setFilter({ ...filter, minPrice: 0, maxPrice: 100000 })}>Giá dưới 100.000đ</li>
                  <li onClick={() => setFilter({ ...filter, minPrice: 100000, maxPrice: 200000 })}>100.000đ - 200.000đ</li>
                  <li onClick={() => setFilter({ ...filter, minPrice: 200000, maxPrice: 300000 })}>200.000đ - 300.000đ</li>
                  <li onClick={() => setFilter({ ...filter, minPrice: 300000, maxPrice: 400000 })}>300.000đ - 400.000đ</li>
                  <li onClick={() => setFilter({ ...filter, minPrice: 500000, maxPrice: null })}>Giá trên 500.000đ</li>
                </ul>
              </div>

              {/* Dropdown size */}
       <div className={`dropdown ${!activeCategory ? "disabled" : ""}`}>
  <button
    className="filter-button"
    disabled={!activeCategory}
    onClick={() => {
      if (activeCategory) setSizeOpen(!sizeOpen);
    }}
  >
    <span className="dropdown-title">
      {filter.size || (activeCategory ? "Chọn kích cỡ" : "Tất cả kích cỡ")}
    </span>
    <span className="dropdown-icon">{activeCategory ? "▼" : ""}</span>
  </button>

  {/* ⚠️ Chỉ hiện khi đã mở */}
  {activeCategory && sizeOpen && (
    <ul className="dropdown-menu show">
      {getSizeOptions().map((size) => (
        <li
          key={size}
          className={filter.size === size ? "active" : ""}
          onClick={() => {
            setFilter({ ...filter, size });
            setSizeOpen(false); // 👉 Đóng lại menu
          }}
        >
          {size}
        </li>
      ))}
    </ul>
  )}
</div>



            </div>

            {/* Dropdown sort */}
            <div className="sort-option dropdown">
              <button className="filter-button sort-link">
                <span className="dropdown-title">Sắp xếp theo</span>
                <span className="dropdown-icon">▼</span>
              </button>
              <ul className="dropdown-menu">
                <li onClick={() => setFilter({ ...filter, sort: "price_asc" })}>Theo giá tăng dần</li>
                <li onClick={() => setFilter({ ...filter, sort: "price_desc" })}>Theo giá giảm dần</li>
                <li onClick={() => setFilter({ ...filter, sort: "newest" })}>Mới nhất</li>
              </ul>
            </div>
          </div>


          <div className="products-grid">
            <div className="product-items-new">
              <ProductList products={ products } />
            </div>
            
          </div>
        </div>
      </div>
      <FilterEffectJS></FilterEffectJS>
    </>
  );
}
