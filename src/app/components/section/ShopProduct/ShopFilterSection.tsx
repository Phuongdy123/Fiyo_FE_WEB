"use client";

import { useState } from "react";
import type { IFilter } from "@/app/untils/IFilter";

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
}

export default function ShopFilterSection({
  filters,
  onFilterChange,
  categories = [],
  parentSlug, // giữ nguyên để sau này cần điều hướng ngoài trang shop
}: {
  filters: IFilter & { categoryId?: string | null };
  onFilterChange: (filters: IFilter & { categoryId?: string | null }) => void;
  categories?: ICategory[];
  parentSlug?: string;
}) {
  const [openFilterMobile, setOpenFilterMobile] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openColor, setOpenColor] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSize, setOpenSize] = useState(true);

  const updateFilter = (key: keyof (IFilter & { categoryId?: string | null }), value: any) => {
    const prevValue = (filters as any)[key];
    const newValue =
      typeof value === "string" && typeof prevValue === "string"
        ? prevValue.toLowerCase() === value.toLowerCase()
          ? null
          : value
        : prevValue === value
        ? null
        : value;
    onFilterChange({ ...(filters as any), [key]: newValue });
  };

  const adultSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const kidSizes: string[] = [];
  const currentSizes = [...adultSizes, ...kidSizes];

  const colors = [
    { key: "trắng", image: "trang.png" },
    { key: "đen", image: "den.png" },
    { key: "đỏ", image: "do.png" },
    { key: "be", image: "be.png" },
    { key: "xám", image: "xam.png" },
    { key: "tím", image: "tim.png" },
    { key: "xanh da trời", image: "xanh_da_troi.png" },
    { key: "hồng", image: "hong.png" },
    { key: "xanh lá", image: "xanh_la_cay.png" },
    { key: "vàng", image: "vang.png" },
    { key: "kẻ", image: "ke.png" },
  ];

  return (
    <>
      <div className="toolbar-filter__action" onClick={() => setOpenFilterMobile(true)}>
        <span>Bộ lọc</span>
      </div>
      {openFilterMobile && (
        <div className="filter-overlay" onClick={() => setOpenFilterMobile(false)} />
      )}

      <div
        className={`columns__sidebar columns__sidebar--desktop ${
          openFilterMobile ? "active" : ""
        }`}
      >
        <div className="title-category">
          <span>Lọc sản phẩm</span>
          <span className="close-filter" onClick={() => setOpenFilterMobile(false)}>
            ×
          </span>
        </div>

        {/* Danh mục trong shop (click để set filters.categoryId, không chuyển trang) */}
        <div className="filter filter--category">
          <div className="filter__item">
            <div className="filter__item-title" onClick={() => setOpenCategory(!openCategory)}>
              <span>Danh mục sản phẩm</span>
              <span className="btn-close">{openCategory ? "–" : "+"}</span>
            </div>
            {openCategory && (
              <div className="filter__item-content">
                <div className="filter__options filter__options--link">
                  <div
                    className={`filter__option-link ${
                      !filters.categoryId ? "active" : ""
                    }`}
                    onClick={() => updateFilter("categoryId", null)}
                    title="Tất cả danh mục"
                  >
                    Tất cả
                  </div>

                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className={`filter__option-link ${
                        filters.categoryId === c._id ? "active" : ""
                      }`}
                      onClick={() => {
                        updateFilter("categoryId", c._id);
                        setOpenFilterMobile(false);
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kích cỡ */}
        <div className="filter filter--attribute">
          <div className="filter__item">
            <div className="filter__item-title" onClick={() => setOpenSize(!openSize)}>
              <span>Kích cỡ</span>
              <span className="btn-close">{openSize ? "–" : "+"}</span>
            </div>
            {openSize && (
              <div className="filter__item-content">
                <div className="filter__options filter__options--size">
                  {currentSizes.map((size) => (
                    <div
                      key={size}
                      className={`filter__option-size ${
                        filters.size === size ? "selected" : ""
                      }`}
                      onClick={() => updateFilter("size", size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Màu sắc */}
          <div className="filter__item">
            <div className="filter__item-title" onClick={() => setOpenColor(!openColor)}>
              <span>Màu sắc</span>
              <span className="btn-close">{openColor ? "–" : "+"}</span>
            </div>
            {openColor && (
              <div className="filter__item-content">
                <div className="filter__options filter__options--color">
                  {colors.map((color) => (
                    <div
                      key={color.key}
                      className={`filter__option-color ${
                        (filters.color || "").toLowerCase() === color.key.toLowerCase()
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => updateFilter("color", color.key)}
                    >
                      <div
                        title={color.key}
                        className="filter__option-color--value"
                        style={{
                          backgroundImage: `url("https://2885371169.e.cdneverest.net/pub/media/attribute/swatch/images/${color.image}")`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Giá */}
          <div className="filter__item">
            <div className="filter__item-title" onClick={() => setOpenPrice(!openPrice)}>
              <span>Khoảng giá</span>
              <span className="btn-close">{openPrice ? "–" : "+"}</span>
            </div>
            {openPrice && (
              <div className="filter__item-content">
                <div className="filter__options filter__options--price price-range">
                  {/* giữ nguyên slider của bạn (đã rút gọn cho ngắn) */}
                  {/* ... */}
                </div>
              </div>
            )}
          </div>

          {/* Apply */}
          <div className="filter__item">
            <div className="filter__actions">
              <div className="filter__apply" onClick={() => setOpenFilterMobile(false)}>
                <span>Áp dụng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
