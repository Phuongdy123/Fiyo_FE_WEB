// /components/shop/ShopFilterSection.tsx
"use client";
import { useState, useEffect } from "react";
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
}: {
  filters: IFilter;
  onFilterChange: (filters: IFilter) => void;
  categories?: ICategory[];
}) {
  const [openFilterMobile, setOpenFilterMobile] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openColor, setOpenColor] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSize, setOpenSize] = useState(true);

  const updateFilter = (key: keyof IFilter, value: any) => {
    const prevValue = filters[key];
    const newValue =
      typeof value === "string" && typeof prevValue === "string"
        ? prevValue.toLowerCase() === value.toLowerCase()
          ? null
          : value
        : prevValue === value
        ? null
        : value;
    onFilterChange({ ...filters, [key]: newValue });
  };

  const handleMouseDown = (e: React.MouseEvent, isMin: boolean) => {
    const trackContainer = document.querySelector(".track-container");
    if (!trackContainer) return;

    const rect = trackContainer.getBoundingClientRect();
    const trackWidth = rect.width;
    let tempValue = isMin ? filters.minPrice ?? 99000 : filters.maxPrice ?? 399000;

    const onMouseMove = (event: MouseEvent) => {
      const rawValue = Math.round(
        ((event.clientX - rect.left) / trackWidth) * (399000 - 99000) + 99000
      );
      if (isMin) {
        tempValue = Math.max(99000, Math.min(rawValue, (filters.maxPrice ?? 399000) - 10000));
      } else {
        tempValue = Math.min(399000, Math.max(rawValue, (filters.minPrice ?? 99000) + 10000));
      }
      const dot = isMin
        ? document.querySelector(".vue-slider-dot.track1")
        : document.querySelector(".vue-slider-dot.track2");
      if (dot) {
        const percent = ((tempValue - 99000) / (399000 - 99000)) * 100;
        (dot as HTMLElement).style.left = `${percent}%`;
        const highlight = document.querySelector(".track-highlight");
        if (highlight) {
          const min = isMin ? tempValue : filters.minPrice ?? 99000;
          const max = isMin ? filters.maxPrice ?? 399000 : tempValue;
          const left = ((min - 99000) / (399000 - 99000)) * 100;
          const width = ((max - min) / (399000 - 99000)) * 100;
          (highlight as HTMLElement).style.left = `${left}%`;
          (highlight as HTMLElement).style.width = `${width}%`;
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      isMin ? updateFilter("minPrice", tempValue) : updateFilter("maxPrice", tempValue);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const adultSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const kidSizes: string[] = []; // shop page ít khi cần size trẻ em; tùy em bật thêm
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
      {openFilterMobile && <div className="filter-overlay" onClick={() => setOpenFilterMobile(false)} />}

      <div className={`columns__sidebar columns__sidebar--desktop ${openFilterMobile ? "active" : ""}`}>
        <div className="title-category">
          <span>Lọc sản phẩm</span>
          <span className="close-filter" onClick={() => setOpenFilterMobile(false)}>×</span>
        </div>

        {/* Danh mục trong shop (optional) */}
        <div className="filter filter--category">
          <div className="filter__item">
            <div className="filter__item-title" onClick={() => setOpenCategory(!openCategory)}>
              <span>Danh mục sản phẩm</span>
              <span className="btn-close">{openCategory ? "–" : "+"}</span>
            </div>
            {openCategory && (
              <div className="filter__item-content">
                <div className="filter__options filter__options--link">
                  {categories.map((c) => (
                    <div key={c._id} className="filter__option-link">{c.name}</div>
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
                      className={`filter__option-size ${filters.size === size ? "selected" : ""}`}
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
                        filters.color?.toLowerCase() === color.key.toLowerCase() ? "selected" : ""
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
                  <div className="price-range-slide">
                    <span className="range-value min">
                      {(filters.minPrice ?? 99000).toLocaleString("vi-VN")}đ
                    </span>
                    <span className="range-value max">
                      {(filters.maxPrice ?? 399000).toLocaleString("vi-VN")}đ
                    </span>
                    <div className="track-container">
                      <div className="track" />
                      <div
                        className="track-highlight"
                        style={{
                          left: `${(((filters.minPrice ?? 99000) - 99000) / (399000 - 99000)) * 100}%`,
                          width: `${(((filters.maxPrice ?? 399000) - (filters.minPrice ?? 99000)) / (399000 - 99000)) * 100}%`,
                        }}
                      />
                      <button
                        className="vue-slider-dot track1"
                        style={{
                          left: `${(((filters.minPrice ?? 99000) - 99000) / (399000 - 99000)) * 100}%`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, true)}
                      />
                      <button
                        className="vue-slider-dot track2"
                        style={{
                          left: `${(((filters.maxPrice ?? 399000) - 99000) / (399000 - 99000)) * 100}%`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, false)}
                      />
                    </div>
                  </div>
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
